import { ContactDto } from "./contact.dto";
import {SpammerStatus} from './contact.dto';
import { Indiaprefixlocationmaps } from "src/carrierService/carrier.info.schema";
import { CarrierService } from "src/carrierService/carrier.service";
import { parsePhoneNumberFromString, PhoneNumber } from "libphonenumber-js";
import { ContactController } from "./contact.controller";
import { Inject } from "@nestjs/common";
import {BulkWriteInsertOneOperation, BulkWriteOperation, Db} from "mongodb";
import * as chalk from "chalk";

import { MongoInsertDTO } from "./mongoinsertdto";
import { ContactRequestDTO } from "./contactRequestDTO";

import {ContactReturnDto} from "../multiple-number-search/contactReturn.dto";
import {ContactObjectTransformHelper} from "../utils/ContactObjectTransformHelper";
import {CollectionNames} from "../db/collection.names";
import {RehashedItemWithOldHash} from "../multiple-number-search/RehashedItemwithOldHash";
import { DatabaseModule } from "src/db/Database.Module";
import { ContactDocument } from "src/contactManage/dto/contactDocument";
import { ContactProcessingItem } from "src/contactManage/dto/contactProcessingItem";
const hash = require('crypto').createHash;



const worker = require("workerpool");
// const sm = require('./worker/serviceHelper.js')
declare function require(name:string);
var workerpool = require('workerpool');

export class ContactService {
    // constructor(@InjectModel("Contact") private readonly contactModel: Model<Contact>,
    // @InjectModel("Indiaprefixlocationmaps") private readonly carrierInfoModel: Model<Indiaprefixlocationmaps>) { }
    constructor(@Inject(DatabaseModule.DATABASE_CONNECTION) private db:Db) { }

    contactsListWithCarrierInfoProcessing:ContactProcessingItem[];
     contactsListForResponse:RehashedItemWithOldHash[];
    contactsListForDb:ContactDocument[]

    async getCarrierInfo(firstNDigitsToGetCarrierInfo: string, countryCode:number, countryISO:string):Promise<Indiaprefixlocationmaps> {
        firstNDigitsToGetCarrierInfo = firstNDigitsToGetCarrierInfo.replace("(","")
        firstNDigitsToGetCarrierInfo = firstNDigitsToGetCarrierInfo.replace(")","")
    console.log(`searching for carrier info : ${firstNDigitsToGetCarrierInfo}`)

    let info:Indiaprefixlocationmaps = await CarrierService.getInfo(firstNDigitsToGetCarrierInfo,this.db, countryCode, countryISO)
    
    
    return info;


  }

  
/**
 * db.users.update({name:"jithinn"}, {$set:{age:23}}, {upsert:true})
 *  bulk.find({name:"jithin"}).upsert().updateOne({$setOnInsert:{"age":2}, $set:{"new":"idk"} });
 *  bulk.find({name:"jithin"}).upsert().updateOne({$setOnInsert:{"age":2}, $set:{"new":"idk"} });
 * @param contacts contacts in request body to be saved in database
 * @param countryCode
 * @param countryISO
 */
  async uploadBulk(contacts:ContactRequestDTO[], countryCode:number, countryISO:string): Promise<RehashedItemWithOldHash[]>{
      const bulkOp = await this.db.collection(CollectionNames.CONTACTS_OF_COLLECTION).initializeUnorderedBulkOp()
      this.contactsListWithCarrierInfoProcessing = []
      this.contactsListForResponse = []
      this.contactsListForDb = []



    // await  this.setCarrierInfoIncontacts(contacts, countryCode, countryISO)
    // await this.rehashAllNumbers()

    /**
     * I can only bulk insert after completing promise.settle all, otherwise parellel
     * operation results in data not being inserted if there is a duplicate
     */
    await this.performBulkInsert(bulkOp)

    try{
        await bulkOp.execute()
    }catch(e){
        console.log(chalk.red(`bulk insert contacts error ${e}`))
    }finally{
        return this.contactsListForResponse;
    }
  }

    private async setCarrierInfoIncontacts(contacts: ContactRequestDTO[], countryCode: number, countryISO: string) {
        // let arr = await Promise.allSettled(contacts.map(async contact=>{

        //     try{
        //         const [carrierInfo] = await Promise.allSettled(
        //             [
        //                 this.getCarrierInfo(contact.phoneNumber, countryCode, countryISO)
        //             ]
        //         )

        //         if(carrierInfo.status === "fulfilled" ){
        //             let contactWithCarrierInfo = new ContactProcessingItem();

        //             if( carrierInfo.value != undefined){
        //                 ContactObjectTransformHelper.setCarrierInfoPromiseType(contactWithCarrierInfo, carrierInfo)
        //                 console.log(contactWithCarrierInfo.carrier)
        //                 // contactWithCarrierInfo.carrier = carrierInfo.value.carrier.trim();
        //                 // contactWithCarrierInfo.lineType = carrierInfo.value.lineType.trim()
        //                 // contactWithCarrierInfo.location = carrierInfo.value.location.trim();

        //             }
        //             contactWithCarrierInfo.spamCount = 0;

        //             contactWithCarrierInfo.hashedPhoneNumber = contact.hashedPhoneNumber
        //             contactWithCarrierInfo.firstName = contact.name;
        //             contactWithCarrierInfo.prevHash = contact.phoneNumber;


        //             console.log(`first n digit while inserting is ${contactWithCarrierInfo.prevHash}`)
        //             this.contactsListWithCarrierInfoProcessing.push(contactWithCarrierInfo);
        //         }


        //     }catch(e){
        //         console.log(chalk.red(`${e} for phone no `))
        //     }


        // }))
    }

    private async rehashAllNumbers() {
        await Promise.allSettled(this.contactsListWithCarrierInfoProcessing.map(async  cntct=>{
            try{
                let hashedNum = await this.getHashedPhonenNum(cntct.hashedPhoneNumber)
                cntct.hashedPhoneNumber = hashedNum

                let contactDoc =  ContactObjectTransformHelper.prepareContactDocForInsertingIntoDb(cntct)
                let contactReturnObj = await this.prepareContactReturnObj(cntct)

                this.contactsListForDb.push(contactDoc);
                this.contactsListForResponse.push(contactReturnObj)

            }catch (e){

                console.log(chalk.red(`error while hashing phone number ${e}`))
            }
        }))
    }

    private async prepareContactReturnObj(cntct: ContactProcessingItem) : Promise<RehashedItemWithOldHash>{

        let contactReturnObj = new RehashedItemWithOldHash();
        contactReturnObj.phoneNumber = cntct.prevHash
        contactReturnObj.carrier = cntct.carrier;
        contactReturnObj.country = cntct.country
        contactReturnObj.lineType = cntct.lineType
        contactReturnObj.location = cntct.location
        contactReturnObj.spamCount = cntct.spamCount
        contactReturnObj.firstName = cntct.firstName
        return contactReturnObj;

    }

    async getHashedPhonenNum(phoneNumForHashing: string):Promise<string> {
       let no= await hash('sha256').update(phoneNumForHashing).digest('base64')
       return no
    }
    getPreparedNumForLookup(phone:string) : string{
        let numForLookup = phone.trim()
                numForLookup = numForLookup.replace("+", "")
                //todo replace (and ) with ''

                if(numForLookup[0] != "9" && numForLookup[1] != "1"){
                    // numForLookup = numForLookup.slice(2,numForLookup.length)
                    numForLookup = "+91"+numForLookup
                }
                return numForLookup
    }







    async migrate(){
        // const res:TestDTO[] = await this.db.collection(Constants.COLLECCTION_INDIA_NUMBER_GEOINFO).find({}).toArray()

        const bulktInsert = await this.db.collection("testcollection").initializeUnorderedBulkOp()
        const res : MongoInsertDTO[]= [{_id:"1", location:"kerala"}, {_id:"2", location:"banglore"}, {_id:"3", location:"delhi"}]
        for await(const contact of res){
            const obj = new MongoInsertDTO()
            obj._id = contact._id
            obj.location = contact.location
            bulktInsert.insert(obj)


        }
        bulktInsert.execute();
    }
    // initFields(cntct:ContactInsertDTO){
    //     let ob:SpammerStatus = Object.create(null);
    //     ob.spamCount = 0;
    //     ob.spammer = false;
    //     cntct.spammerStatus = ob;
    //     cntct.carrier = ""
    //     cntct.line_type = ""
    //     cntct.location = ""
    //     cntct.country = ""
    //     cntct.line_type = ""
    //
    // }


    private async performBulkInsert(bulkOp: any) {
        for await(const c of this.contactsListForDb){

            bulkOp.insert(c)

        }
    }

    // private async prepareContactDocForInsertingIntoDb(cntct: ContactProcessingItem): Promise<ContactDocument> {
    //     let contactDoc = new ContactDocument();
    //     contactDoc._id = cntct.hashedPhoneNumber
    //     contactDoc.carrier = cntct.carrier;
    //     contactDoc.country = cntct.country
    //     contactDoc.lineType = cntct.lineType
    //     contactDoc.location = cntct.location
    //     contactDoc.spamCount = cntct.spamCount
    //     contactDoc.name = cntct.name;
    //
    //     return contactDoc;
    // }
}



// private async setCarrierInfoInAllItem(contacts: ContactRequestDTO[], countryCode: number, countryISO: string) : Promise<ContactReturnDTOItems[]> {
//     let contactsReturnArray:ContactReturnDTOItems[] = []
//
//     let contactdto:ContactInsertDTO ;
//     let contactReturnItem:ContactReturnDTOItems;
//
//     let arr = await Promise.allSettled(contacts.map(async contact=>{
//         let firstNDigitsToGetCarrierInfo = ""
//         try{
//             contactdto = new ContactInsertDTO();
//             // contactdto.firstNDigits = contact.firstNDigits.replace("*","").replace("#", "").replace("-","").replace("(","").replace(")","").trim()
//             contactdto.phoneNumber = contact.hashedPhoneNumber.trim();
//             contactdto.name = contact.name;
//             this.initFields(contactdto);
//
//             firstNDigitsToGetCarrierInfo = contact.hashedPhoneNumber
//             const [carrierInfo] = await Promise.allSettled(
//                 [
//                     this.getCarrierInfo(firstNDigitsToGetCarrierInfo, countryCode, countryISO)
//                 ]
//             )
//
//             let ob:SpammerStatus = Object.create(null);
//             ob.spamCount = 0;
//             ob.spammer = false;
//
//             contactdto.spammerStatus = ob;
//             contactdto.spammerStatus.spamCount = 0;
//
//             let document = new ContactDocument();
//
//             contactReturnItem = new ContactReturnDTOItems();
//
//
//             if(carrierInfo.status === "fulfilled" ){
//                 if( carrierInfo.value != undefined){
//                     contactdto.carrier = carrierInfo.value.carrier.trim();
//                     contactdto.line_type = carrierInfo.value.lineType.trim();
//                     contactdto.location = carrierInfo.value.location.trim();
//
//
//                     document.carrier = carrierInfo.value.carrier.trim();
//                     document.lineType = carrierInfo.value.lineType.trim()
//                     document.location = carrierInfo.value.location.trim();
//                     document.spammCount = 0;
//
//                     contactReturnItem.carrier = carrierInfo.value.carrier.trim();
//                     contactReturnItem.lineType = carrierInfo.value.lineType.trim()
//                     contactReturnItem.location = carrierInfo.value.location.trim();
//                     contactReturnItem.spamCount = 0;
//                 }
//
//
//                 console.log(`first n digit while inserting is ${contactReturnItem.firstNDigits}`)
//                 contactsReturnArray.push(contactReturnItem);
//
//             }
//
//
//         }catch(e){
//             console.log(`${e} for phone no ${firstNDigitsToGetCarrierInfo}`)
//         }
//
//     }))
//     return contactsReturnArray
// }

    // async  add(num1, num2) {
    //     async  add(contacts:ContactDto[]) {
    //     contacts.forEach(async cntct=>{
    //         try{
    //             console.log(cntct)
    //             let contactObj = new this.contactModel(cntct)
    //             let savedContact = await contactObj.save()
    //             console.log(savedContact);
    //         }catch(e){
    //             console.log("error while saving" +e);
    //         }
            
    //     })
    //     return  num1 + num2;
    // }
  

    // async upload(contacts:ContactDto[]) :Promise<ContactDto[]>{
        
       
    //    let contactsArrWithCarrierInfo:ContactDto []=  await this.getContactWithHashedInfo(contacts)
    //     for(let i =0; i<contactsArrWithCarrierInfo.length; i++){
    //         console.log("inserting " , contactsArrWithCarrierInfo[i])
    //         let reslt = await this.db.collection('contactsNew').insertOne(contactsArrWithCarrierInfo[i])
    //         console.log(`Inserted contact ${reslt}`)
    //     }
        
       
    //         return contactsArrWithCarrierInfo;

    // }
  /**
   * 
   * @param contacts @param contacts
   * @returns ContactsDTO[] with carrier information and geographical information about a number
   */

//   async getContactWithHashedInfo(contacts:ContactDto[]) :Promise<ContactDto[]>{
//     let contactsArrWithCarrierInfo:ContactDto[] = [];
//     let savedContact
//     return  new Promise(async(resolve, reject)=>{
//         for await(const cntct of contacts){ 
//             try{
//                 this.initFields(cntct);
//                 //TODO  check if I can perform aggregation, ie whlie inserting search for carrier info within database
//                 let numForLookup = cntct.firstNDigits.trim()
                
//                 let hashedPhone = await hash('sha256').update(cntct.phoneNumber.trim()).digest('base64');
                
//                 console.log('hashed phone number is ',hashedPhone);
    
    
//                 // try{
//                     let contactInfoFromDb =  await this.db.collection(Constants.COLLECTION_CONTACTS_NEW).findOne({phoneNumber:hashedPhone})
//                     console.log("contact fetched is ", contactInfoFromDb);
//                     if(contactInfoFromDb== null){
//                         // let contactObj = new this.contactModel(cntct)
//                         /**
//                          * If the current number not in databse then get carrier information
//                          * and push it into array for later saving into database
//                          * 
//                          */
//                         let carrierInfo = await this.getCarrierInfo(numForLookup) 
                
//                         console.log("carrier info "+carrierInfo)
                        
//                         let ob:SpammerStatus = Object.create(null);
//                         ob.spamCount = 0;
//                         ob.spammer = false;
                        
//                         if(carrierInfo ){
//                             //todo replace all - and spaces from phone numbe
//                            cntct.spammerStatus = ob;
//                             cntct.spammerStatus.spamCount = 0;
//                             cntct.carrier = carrierInfo.carrier.trim();
//                             cntct.line_type = carrierInfo.line_type.trim();
//                             cntct.location = carrierInfo.location.trim();
                        
//                             cntct.phoneNumber = hashedPhone.trim();
                            
//                             // cntct.spammerStatus.spammer = "false";
                              
                        
                                                      
//                         }
//                         contactsArrWithCarrierInfo.push(cntct);
//                         // contactsArrWithCarrierInfo.push({"insertOne":{"document":cntct}});
                       
                      
    
//                     }else{
//                         console.log("alredy exising");
//                     }
//                 //    }catch(e){
//                 //        console.log("error while fetching "+e)
//                 //    }
                
//             }catch(e){
//                 reject(e)
//                 console.log("error while saving" ,e);
//             }
    
//         }
        
//         return resolve(contactsArrWithCarrierInfo)
//     })
    
//   }
