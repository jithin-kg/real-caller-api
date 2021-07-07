import { HttpStatus, Inject } from '@nestjs/common';
import * as chalk from "chalk";
import { Db } from 'mongodb';
import { Indiaprefixlocationmaps } from 'src/carrierService/carrier.info.schema';
import { CollectionNames } from 'src/db/collection.names';
import { DatabaseModule } from 'src/db/Database.Module';
import { ContactObjectTransformHelper } from 'src/utils/ContactObjectTransformHelper';
import { GenericServiceResponseItem } from 'src/utils/Generic.ServiceResponseItem';
import { HttpMessage } from 'src/utils/Http-message.enum';
import { FirebaseMiddleware } from './../auth/firebase.middleware';
import { ContactDocument } from './contactDocument';
import { ContactProcessingItem } from './contactProcessingItem';
import { ContactRehashedItemWithOldHash } from './contactRehashedItemwithOldHash';
import { ContactRequestDTO } from './contactRequestDTO';
import { ContactUploadHelper  as Helper} from './contactUploadHelper';
import { ReqBodyDTO } from './myContacts/reqBodyDTO';
import { do_AES_decryption, do_AES_encryption, findDifference } from './myContacts/saveContactsHelper';
const hash = require('crypto').createHash;
export class ContactManageService {
    constructor(@Inject(DatabaseModule.DATABASE_CONNECTION) private db: Db) { }
    contactsListWithCarrierInfoProcessing: ContactProcessingItem[];
    contactsListForResponse: ContactRehashedItemWithOldHash[];
    contactsListForDb: ContactDocument[]
    async getHashedPhonenNum(phoneNumForHashing: string): Promise<string> {
        let no = await hash('sha256').update(phoneNumForHashing).digest('base64')
        return no
    }


    async doRehashAllNumbers(contacts: ContactRequestDTO[], countryCode: number, countryISO: string) {

        await Promise.allSettled(contacts.map(async contact => {
            try {
                // dummy carrierInfo set
                const [carrierInfo] = await Promise.allSettled(
                    [
                        Helper.getCarrierInfo( countryCode, countryISO)
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
                    let contactReturnObj = Helper.prepareContactReturnObj(contactWithCarrierInfo)


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
    async uploadBulkContacts(contacts: ContactRequestDTO[], countryCode: number, countryISO: string): Promise<GenericServiceResponseItem<ContactRehashedItemWithOldHash[]>> {
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
            return  new GenericServiceResponseItem(HttpStatus.OK, HttpMessage.OK,this.contactsListForResponse )  ;
        }
    }
    async fetchSavedContactsOfUser(hUid: string): Promise<string> {
        return new Promise(async resolve => {
            try {
                const query = { _id: hUid };
                const existData =
                    await this.db.collection(CollectionNames.MY_CONTACTS).findOne(query)
                console.log("existData: ", existData);
                resolve(existData?.contacts || "")
            } catch (error) {
                console.log("fetchSavedContactsOfUser_error : ", error);
                resolve("")
            }
        })
    }
    async update_upsert_saveMycontacts(hUid: string, encryptedString: string) {
        return new Promise(async resolve => {
            const query = { _id: hUid };
            const update = { $set: { "contacts": encryptedString } };
            await this.db.collection(CollectionNames.MY_CONTACTS).updateOne(
                query, update, { upsert: true }).then(res => {
                    console.log("upsert:success: ");
                    resolve(1)
                }).catch(err => {
                    console.log("upsert:failed: ", err);
                    resolve(0)
                })
        })
    }
    async saveMyContacts(contacts: ReqBodyDTO, _req) {
        return new Promise(async (resolve, reject) => {
            try {
                console.log(chalk.green('going to save...'))
                const _userData = await FirebaseMiddleware.getUserId(_req);
                const hUid = _userData.hUserId || "";
                //fetch contacts if exist
                const contactExisted_encrypted_string = await this.fetchSavedContactsOfUser(hUid);
                if (contactExisted_encrypted_string && contacts.contacts) {
                    const { contacts: newContacts = [] } = contacts;         // A
                    //perform decryption to get stored contacts
                    let decryptedData = await do_AES_decryption(contactExisted_encrypted_string) // B
                    console.log("decryptedData--existed : ", decryptedData)
                    //perform A-B >> to find new contacts
                    const results = await findDifference(newContacts, decryptedData);
                    console.log('A-B >> unique data', results); //U
                    //perform B+U >> to append new contacts with existed contacts
                    contacts.contacts = decryptedData.concat(results);
                    console.log('B+U >> existing data + unique data', contacts.contacts);
                } else { console.log("there is no data for this user") }
                //encrypt contacts array >> to save
                const encryptedString = await do_AES_encryption(contacts.contacts)
                //perform upsert
                let isSuccess = await this.update_upsert_saveMycontacts(hUid, encryptedString);
                resolve(await isSuccess)
            } catch (error) {
                console.log("catch error:", error);
                reject(0)
            }
        });
    }
}