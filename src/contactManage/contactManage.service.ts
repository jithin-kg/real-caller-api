import { Inject } from '@nestjs/common';
import * as chalk from "chalk";
import CryptoJS from "crypto-js";
import { Db } from 'mongodb';
import { Indiaprefixlocationmaps } from 'src/carrierService/carrier.info.schema';
import { CollectionNames } from 'src/db/collection.names';
import { ContactObjectTransformHelper } from 'src/utils/ContactObjectTransformHelper';
import { FirebaseMiddleware } from './../auth/firebase.middleware';
import { ContactDocument } from './contactDocument';
import { ContactProcessingItem } from './contactProcessingItem';
import { ContactRehashedItemWithOldHash } from './contactRehashedItemwithOldHash';
import { ContactRequestDTO } from './contactRequestDTO';
import { ReqBodyDTO } from './myContacts/reqBodyDTO';
const hash = require('crypto').createHash;
const SECRET_KEY: string = "___thisissecretkey___";
export class ContactManageService {
    constructor(@Inject('DATABASE_CONNECTION') private db: Db) { }
    contactsListWithCarrierInfoProcessing: ContactProcessingItem[];
    contactsListForResponse: ContactRehashedItemWithOldHash[];
    contactsListForDb: ContactDocument[]
    async getHashedPhonenNum(phoneNumForHashing: string): Promise<string> {
        let no = await hash('sha256').update(phoneNumForHashing).digest('base64')
        return no
    }
    private prepareContactReturnObj(cntct: ContactProcessingItem): ContactRehashedItemWithOldHash {

        let contactReturnObj = new ContactRehashedItemWithOldHash();
        contactReturnObj.phoneNumber = cntct.prevHash
        contactReturnObj.carrier = cntct.carrier;
        contactReturnObj.country = cntct.country
        contactReturnObj.lineType = cntct.lineType
        contactReturnObj.location = cntct.location
        contactReturnObj.spamCount = cntct.spamCount
        contactReturnObj.firstName = cntct.firstName
        if (cntct.isRegistered) {
            contactReturnObj.isRegistered = cntct.isRegistered
            contactReturnObj.hUname = cntct.hUname
        }
        return contactReturnObj;

    }
    async getCarrierInfo(firstNDigitsToGetCarrierInfo: string, countryCode: number, countryISO: string): Promise<Indiaprefixlocationmaps> {

        let info: Indiaprefixlocationmaps = new Indiaprefixlocationmaps();
        return info;
    }
    async doRehashAllNumbers(contacts: ContactRequestDTO[], countryCode: number, countryISO: string) {

        await Promise.allSettled(contacts.map(async contact => {

            try {
                // dummy carrierInfo set
                const [carrierInfo] = await Promise.allSettled(
                    [
                        this.getCarrierInfo(contact.phoneNumber, countryCode, countryISO)
                    ]
                )

                if (carrierInfo.status === "fulfilled") {
                    let contactWithCarrierInfo = new ContactProcessingItem();

                    if (carrierInfo.value != undefined) {
                        ContactObjectTransformHelper.setCarrierInfoPromiseType(contactWithCarrierInfo, carrierInfo)
                        console.log(contactWithCarrierInfo.carrier)
                    }
                    contactWithCarrierInfo.spamCount = 0;
                    contactWithCarrierInfo.hashedPhoneNumber = contact.hashedPhoneNumber
                    contactWithCarrierInfo.firstName = contact.name;
                    contactWithCarrierInfo.prevHash = contact.hashedPhoneNumber;


                    console.log(`first n digit while inserting is ${contactWithCarrierInfo.prevHash}`)
                    // this.contactsListWithCarrierInfoProcessing.push(contactWithCarrierInfo);

                    //--------------old rehashAllNumbers()--------------------------
                    let hashedNum = await this.getHashedPhonenNum(contactWithCarrierInfo.hashedPhoneNumber)
                    contactWithCarrierInfo.hashedPhoneNumber = hashedNum
                    //-------isUserExist ? put isRegistered and hUname field
                    let _userInfo = await this.db.collection(CollectionNames.USERS_COLLECTION)
                        .findOne({ _id: contactWithCarrierInfo.hashedPhoneNumber })
                        .catch(err => console.log(`findOne error:{_id:${contactWithCarrierInfo.hashedPhoneNumber}}`, err));
                    if (_userInfo && _userInfo.firstName) {
                        contactWithCarrierInfo.isRegistered = true;
                        contactWithCarrierInfo.hUname = _userInfo.firstName;
                    } else {
                        console.log(`${contactWithCarrierInfo.prevHash} !exist || !registered`)
                    }
                    //---------------------------------------------------------------------
                    let contactDoc = ContactObjectTransformHelper.prepareContactDocForInsertingIntoDb(contactWithCarrierInfo)
                    let contactReturnObj = this.prepareContactReturnObj(contactWithCarrierInfo)

                    this.contactsListForDb.push(contactDoc);
                    this.contactsListForResponse.push(contactReturnObj)
                    //------------------------------------------------------------------
                } else {
                    throw { carrierInfo, message: "carrierInfo.status issue" }
                }
            } catch (e) {
                console.log(chalk.red(`${e} for phone no `))
            }


        }))
    }
    private async performBulkInsert(bulkOp: any) {
        for await (const c of this.contactsListForDb) {
            console.log(`hashed num before inserting is ${c._id}`)
            bulkOp.insert(c)

        }
    }
    async uploadBulkContacts(contacts: ContactRequestDTO[], countryCode: number, countryISO: string): Promise<ContactRehashedItemWithOldHash[]> {
        console.log(chalk.green('going to upload...'))
        const bulkOp = await this.db.collection(CollectionNames.CONTACTS_OF_COLLECTION).initializeUnorderedBulkOp()
        this.contactsListWithCarrierInfoProcessing = []
        this.contactsListForResponse = []
        this.contactsListForDb = []
        console.log(chalk.green('going to perform doRehashAllNumbers...'))
        await this.doRehashAllNumbers(contacts, countryCode, countryISO);
        console.log(chalk.green('going to perform performBulkInsert...'))
        console.log(chalk.green('contactReturnObj...', this.contactsListForResponse))
        await this.performBulkInsert(bulkOp)
        try {
            console.log(chalk.green('going to perform bulkOp.execute...'))
            await bulkOp.execute()
        } catch (e) {
            console.log(chalk.red(`bulk insert contacts error ${e}`))
        } finally {
            console.log(chalk.green(`final data (finally) ${this.contactsListForResponse}`))
            return this.contactsListForResponse;
        }
    }

    async saveMyContacts(contacts: ReqBodyDTO, _req) {
        return new Promise(async (resolve, reject) => {
            try {
                console.log(chalk.green('going to save...'))
                const _userData = await FirebaseMiddleware.getUserId(_req);
                const hUid = _userData.hUserId || "";
                const query = { _id: hUid };
                //fetch contacts if exist
                const existData = await this.db.collection(CollectionNames.MY_CONTACTS).findOne(query)
                console.log("existData: ", existData);
                //if exist then contacts-existData.contact --> then upsert
                if (existData && existData.contacts && contacts.contacts) {
                    const { contacts: newContacts = [] } = contacts;         // A
                    //perform decryption
                    const { contacts: contactExisted_encrypted_string } = existData;
                    var bytes = CryptoJS.AES.decrypt(contactExisted_encrypted_string, SECRET_KEY);
                    let decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8)) || []; // B
                    console.log("decryptedData--existed : ", decryptedData)
                    //perform A-B
                    const results = newContacts.filter(({ hashedPhoneNumber: id1 }) => {
                        !decryptedData.some(({ hashedPhoneNumber: id2 }) => id2 === id1)
                    }); //Unique data U
                    console.log('A-B >> unique data', results);
                    contacts.contacts = decryptedData.concat(results);
                    console.log('B+U >> existing data + unique data', contacts.contacts);
                } else { console.log("there is no data for this user") }

                const encryptedString = await CryptoJS.AES.encrypt(JSON.stringify(contacts.contacts), SECRET_KEY).toString();
                const update = { $set: { "contacts": encryptedString } };
                await this.db.collection(CollectionNames.MY_CONTACTS).updateOne(
                    query, update).then(res => {
                        console.log("upsert:success: ", res);
                        resolve(1)
                    }).catch(err => {
                        console.log("upsert:failed: ", err);
                        reject(0);
                    })
            } catch (error) {
                console.log("catch error:", error);
                reject(0)
            }
        });
    }
}