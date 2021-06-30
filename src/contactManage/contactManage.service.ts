import { Inject } from '@nestjs/common';
import * as chalk from "chalk";
import { Db } from 'mongodb';
import { Indiaprefixlocationmaps } from 'src/carrierService/carrier.info.schema';
import { CollectionNames } from 'src/db/collection.names';
import { ContactObjectTransformHelper } from 'src/utils/ContactObjectTransformHelper';
import { ContactDocument } from './contactDocument';
import { ContactProcessingItem } from './contactProcessingItem';
import { ContactRehashedItemWithOldHash } from './contactRehashedItemwithOldHash';
import { ContactRequestDTO } from './contactRequestDTO';
const hash = require('crypto').createHash;
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
        contactReturnObj.phoneNumber = cntct.phoneNumber
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
        firstNDigitsToGetCarrierInfo = firstNDigitsToGetCarrierInfo.replace("(", "")
        firstNDigitsToGetCarrierInfo = firstNDigitsToGetCarrierInfo.replace(")", "")
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
                    contactWithCarrierInfo.phoneNumber = contact.phoneNumber;


                    console.log(`first n digit while inserting is ${contactWithCarrierInfo.phoneNumber}`)
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
                        console.log(`${contactWithCarrierInfo.phoneNumber} !exist || !registered`)
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
}