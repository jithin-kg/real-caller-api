import { HttpStatus, Inject } from '@nestjs/common';
import { reject } from 'async';
import * as chalk from "chalk";
import { Db, UnorderedBulkOperation } from 'mongodb';
import { Indiaprefixlocationmaps } from 'src/carrierService/carrier.info.schema';
import { CollectionNames } from 'src/db/collection.names';
import { DatabaseModule } from 'src/db/Database.Module';
import { SpamerType } from 'src/spam/dto/spam.type';
import { ContactObjectTransformHelper } from 'src/utils/ContactObjectTransformHelper';
import { GenericServiceResponseItem } from 'src/utils/Generic.ServiceResponseItem';
import { HttpMessage } from 'src/utils/Http-message.enum';
import { processHelper } from 'src/utils/processHelper';
import { FirebaseMiddleware } from './../auth/firebase.middleware';
import { ContactDocument, UserUploadedContacts } from './dto/contactDocument';
import { ContactProcessingItem } from './dto/contactProcessingItem';
import { ContactRehashedItemWithOldHash } from './dto/contactRehashedItemwithOldHash';
import { ContactRequestDTO } from './contactRequestDTO';
import { ContactUploadHelper  as Helper} from './contactUploadHelper';
import { ReqBodyDTO } from './myContacts/reqBodyDTO';
import { do_AES_decryption, do_AES_encryption, findDifference } from './myContacts/saveContactsHelper';
import { RehashedReturnItem } from './dto/rehashedReturnItem';

import { HAccessTokenData } from 'src/auth/accessToken.dto';
import { IdType, NameAndUpvotes, PhoneNumNamAndUploaderDoc } from './dto/phoneNumNameUploaderAssocDoc';
import { NumberTransformService } from 'src/utils/numbertransform.service';
import { UserDoc } from 'src/users/dto/user.doc';

export class ContactManageService {
    constructor(@Inject(DatabaseModule.DATABASE_CONNECTION) private db: Db,
    private numberTransformService: NumberTransformService
    ) { }
    // contactsListWithCarrierInfoProcessing: ContactProcessingItem[];
    // contactsListForResponse: ContactRehashedItemWithOldHash[];
    // contactsListForDb: ContactDocument[]
    
    // async getHashedPhonenNum(phoneNumForHashing: string): Promise<string> {
    //     let no = await hash('sha256').update(phoneNumForHashing).digest('base64')
    //     return no
    // }


    async doRehashAllNumbers(contacts: ContactRequestDTO[], 
        countryCode: string, 
        countryISO: string,
        tokenData:HAccessTokenData,
        bulkdOp: UnorderedBulkOperation,
        bulkOpUploaderAssoc: UnorderedBulkOperation,
        bulkOpUserRehsahedCntct:UnorderedBulkOperation
        ) : Promise<RehashedReturnItem> {
        
        
        let contactsListForDb:ContactDocument[] = []
        let contactsListForResponse:ContactRehashedItemWithOldHash[] = []
        let contatsListNumUploaderAssoc : IdType<NameAndUpvotes>[] = []
        let listOfRehasehdNums : string[] = [];
        return new Promise((resolve, reject)=> {            
            Promise.resolve().then(async res=> {
               let docOfRehsehdNums = await this.db.collection(CollectionNames.REHASHED_NUMS_OF_USER).findOne({_id:tokenData.huid}) as UserUploadedContacts
               let isLessThanLimit = true
               if(docOfRehsehdNums != null || docOfRehsehdNums != undefined ){
                if(docOfRehsehdNums.rehasehdNums != null){
                    isLessThanLimit =  docOfRehsehdNums.rehasehdNums.length <= 5000
                }
               }
               for(let contact of contacts){
                    try {
                        const carrierInfo = await Helper.getCarrierInfo( countryCode, countryISO)
                            let contactWithCarrierInfo = new ContactProcessingItem();
                            if (carrierInfo != undefined) {
                                ContactObjectTransformHelper.setCarrierInfoPromiseType(contactWithCarrierInfo, carrierInfo)

                            }
                            contactWithCarrierInfo.spamCount = 0;
                            contactWithCarrierInfo.hashedPhoneNumber = contact.hashedPhoneNumber
                            contactWithCarrierInfo.nameInPhoneBook = contact.name;
                            contactWithCarrierInfo.prevHash = contact.hashedPhoneNumber;

                    
                            //--------------old rehashAllNumbers()--------------------------
                            let hashedNum = await this.numberTransformService.tranforNum(contactWithCarrierInfo.hashedPhoneNumber)
                            contactWithCarrierInfo.hashedPhoneNumber = hashedNum
                            //-------isUserExist ? put isRegistered and hUname field
                            let alreadyExistingContactInDb = await this.db.collection(CollectionNames.CONTACTS_COLLECTION) 
                                .findOne({ _id: contactWithCarrierInfo.hashedPhoneNumber }) as ContactDocument
                        
                            if (alreadyExistingContactInDb && alreadyExistingContactInDb.hUid) {
                                contactWithCarrierInfo.isRegistered = true;
                                contactWithCarrierInfo.firstName = alreadyExistingContactInDb.firstName;
                                contactWithCarrierInfo.firstName = alreadyExistingContactInDb.lastName;
                                contactWithCarrierInfo.hUid = alreadyExistingContactInDb.hUid
                                contactWithCarrierInfo.bio = alreadyExistingContactInDb.bio
                                contactWithCarrierInfo.email = alreadyExistingContactInDb.email
                                contactWithCarrierInfo.avatarGoogle = alreadyExistingContactInDb.avatarGoogle
                                contactWithCarrierInfo.isVerifiedUser = alreadyExistingContactInDb.isVerifiedUser
                            }
                            //---------------------------------------------------------------------
                            let contactDoc = ContactObjectTransformHelper.prepareContactDocForInsertingIntoDb(contactWithCarrierInfo)
                        
                            contactDoc.spamerType = new SpamerType()
                            let contactReturnObj = Helper.prepareContactReturnObj(contactWithCarrierInfo)
                           
                            let numAndUploaderAssocDoc = {}  as IdType<NameAndUpvotes> 
                            numAndUploaderAssocDoc._id = contactWithCarrierInfo.hashedPhoneNumber;
                            const uploaderHuId = tokenData.huid;
                            // let uploaderAndSuggestedName = new UploaderAndSuggestedName()
                            // uploaderAndSuggestedName[uploaderHuId] = contactWithCarrierInfo.firstName
                            // numAndUploaderAssocDoc.uploaderAndSuggestedName=  uploaderAndSuggestedName
                            let nameAndUpvote = new NameAndUpvotes()
                            nameAndUpvote.nameInPhoneBook = contactWithCarrierInfo.nameInPhoneBook;
                            // numAndUploaderAssocDoc[uploaderHuId] = contactWithCarrierInfo.firstName 
                            numAndUploaderAssocDoc[uploaderHuId] = nameAndUpvote
                            // contactsListForDb.push(contactDoc);
                            contactsListForResponse.push(contactReturnObj)
                            // listOfRehasehdNums.push(contactWithCarrierInfo.hashedPhoneNumber);
                            // contatsListNumUploaderAssoc.push(numAndUploaderAssocDoc);
                           if(isLessThanLimit){
                                try{
                                    if(alreadyExistingContactInDb == null || alreadyExistingContactInDb == undefined)
                                          bulkdOp.insert(contactDoc)
                                }catch(e){
                                    console.log("exception bulkOp ")
                                }
                                try{
                                    
                                    bulkOpUploaderAssoc.find({_id:contactDoc._id}).upsert().updateOne({$set:numAndUploaderAssocDoc})
                                }catch(e){
                                    console.log("exception bulkOpAssoc ")
                                }
                                try{
                                    let userAndContactsDoc = new UserUploadedContacts()
                                    let hUid = tokenData.huid
                                    userAndContactsDoc._id = hUid;
                                    // userAndContactsDoc.rehasehdNums = listOfRehasehdNums
                                    let filter = {
                                        "_id":hUid,
                                        "rehasehdNums.4999":{
                                            "$exists": false
                                        }
                                        
                                    }
                                    bulkOpUserRehsahedCntct.find(filter).upsert().updateOne(
                                    {$addToSet: {"rehasehdNums":contactWithCarrierInfo.hashedPhoneNumber}})
                                }catch(e){
                                    console.log("exception userContactslist bulkop ", e)
                                }
                           }
                    } catch (e) {
                        console.log(chalk.red(`${e} for phone no `))
                        resolve(null)
                    }
                }
                
                resolve(new RehashedReturnItem(contactsListForDb, contactsListForResponse, contatsListNumUploaderAssoc ))
                // resolve("done")
            })
        })
    }
    private async performBulkInsert(bulkOp: any, contactsListForDb:ContactDocument[]): Promise<string>{
        return new Promise((resolve, reject)=> {
            Promise.resolve().then(async res=> {
                try{
                    for await (const c of contactsListForDb) {
                        bulkOp.insert(c)
                    }
                    resolve("Bulk insert completed")
                }catch(e){
                    console.log(chalk.red(`Exception while bulk insert ${e}`))
                    resolve(null)
                }
            })
        })
    }
    //called from controller
    async uploadBulkContacts(contacts: ContactRequestDTO[],
         countryCode: string
         ,
          countryISO: string,
          tokenData: HAccessTokenData
          
          ): Promise<GenericServiceResponseItem<ContactRehashedItemWithOldHash[]>> {
        // const bulkOp = await this.db.collection(CollectionNames.CONTACTS_OF_COLLECTION).initializeUnorderedBulkOp()
        // const reshasehdItems:RehashedReturnItem = await this.doRehashAllNumbers(contacts, countryCode, countryISO);
        let bulkOp:UnorderedBulkOperation = this.db.collection(CollectionNames.CONTACTS_OF_COLLECTION).initializeUnorderedBulkOp()
        let bulkOpNumUploaderAssoc:UnorderedBulkOperation = this.db.collection(CollectionNames.PHONE_NUM_AND_NAME_ASSOCIATION).initializeUnorderedBulkOp()
        let bulkOpUserRehsahedCntct:UnorderedBulkOperation = this.db.collection(CollectionNames.REHASHED_NUMS_OF_USER).initializeUnorderedBulkOp()
        let reshasehdItems:RehashedReturnItem
        
        const processList = [
            this.doRehashAllNumbers(contacts,
                 countryCode,
                  countryISO,
                   tokenData,
                    bulkOp,
                    bulkOpNumUploaderAssoc,
                    bulkOpUserRehsahedCntct
                   )
        ]
        const [reshasehdItemsDefred ] = await processHelper.doParallelProcess(processList)
        
        if(reshasehdItemsDefred.status == processHelper.FULL_FILLED){
            reshasehdItems = reshasehdItemsDefred.value
        }else if(reshasehdItemsDefred.status == processHelper.REJECTED){
            return GenericServiceResponseItem.returnServerErrRes()
        }

        // if(bulkOpDefered.status == processHelper.FULL_FILLED){
        //     bulkOp = bulkOpDefered.value
        // }


        try {
        // await this.performBulkInsert(bulkOp, reshasehdItems.contactsListForDb)
        //  await   this.performBulkUpsertAssociation(bulkOpNumUploaderAssoc, reshasehdItems.phoneNumUploaderAssociation )
            // try{
            //     await bulkOp.execute()
            // }catch(e){
            //     console.log(chalk.red (`Bulkd execution exception $e`))
            // }

            // try{
                const list = [
                    bulkOp.execute(), 
                    bulkOpNumUploaderAssoc.execute(),
                    bulkOpUserRehsahedCntct.execute()
                ]
                await processHelper.doParallelProcess(list)
                // await bulkOpNumUploaderAssoc.execute()
            // }catch(e){
                // console.log(chalk.red (`Bulkd execution exception $e`))
            // }
        } catch (e) {
            console.log(chalk.red('bulk insert contacts error ',e))
        } finally {
            return GenericServiceResponseItem.returnGoodResponse(reshasehdItems.contactsListForRespones)
        }
    }
    async performBulkUpsertAssociation(bulkOpNumUploaderAssoc: UnorderedBulkOperation, phoneNumUploaderAssociationList: IdType<NameAndUpvotes>[]) {
        return new Promise((resolve, reject)=> {
            Promise.resolve().then(async res=> {
                try{
                    for await (const c of phoneNumUploaderAssociationList) {
                        bulkOpNumUploaderAssoc.insert(c)
                    }
                    resolve("Bulk insert completed")
                }catch(e){
                    console.log(chalk.red(`Exception while bulk insert ${e}`))
                    resolve(null)
                }
            })
        })
    }
    async fetchSavedContactsOfUser(hUid: string): Promise<string> {
        return new Promise(async resolve => {
            try {
                const query = { _id: hUid };
                const existData =
                    await this.db.collection(CollectionNames.MY_CONTACTS).findOne(query)
                resolve(existData?.contacts || "")
            } catch (error) {
                console.log("fetchSavedContactsOfUser_error : ", error);
                //do
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
                    // console.log("upsert:success: ");
                    resolve(1)
                }).catch(err => {
                    console.log("upsert:failed: ", err);
                    resolve(0)
                })
        })
    }
    async saveMyContacts(contacts: ReqBodyDTO, _req) : Promise<GenericServiceResponseItem<any>> {
            try {

                const _userData = await FirebaseMiddleware.getUserId(_req);
                const hUid = _userData.hUserId || "";
                //fetch contacts if exist
                const contactExisted_encrypted_string = await this.fetchSavedContactsOfUser(hUid);
                if (contactExisted_encrypted_string && contacts.contacts) {
                    const { contacts: newContacts = [] } = contacts;         // A
                    //perform decryption to get stored contacts
                    let decryptedData = await do_AES_decryption(contactExisted_encrypted_string) // B

                    //perform A-B >> to find new contacts
                    const results = await findDifference(newContacts, decryptedData);

                    //perform B+U >> to append new contacts with existed contacts
                    contacts.contacts = decryptedData.concat(results);
                } else { console.log("there is no data for this user") }
                //encrypt contacts array >> to save
                const encryptedString = await do_AES_encryption(contacts.contacts)
                //perform upsert
                let isSuccess = await this.update_upsert_saveMycontacts(hUid, encryptedString);
                return  GenericServiceResponseItem.returnGoodResponse(isSuccess)
            } catch (error) {
                console.log("catch error:", error);
                return GenericServiceResponseItem.returnServerErrRes()
            }

    }
}