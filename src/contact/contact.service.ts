import { ContactDto } from "./contact.dto";
import {SpammerStatus} from './contact.dto';
import { Indiaprefixlocationmaps } from "src/carrierService/carrier.info.schema";
import { CarrierService } from "src/carrierService/carrier.service";
import { parsePhoneNumberFromString, PhoneNumber } from "libphonenumber-js";
import { ContactController } from "./contact.controller";
import { Inject } from "@nestjs/common";
import { Db } from "mongodb";
import { CarrierInfoDTO } from "src/carrierService/carrier.info.dto";
import { Constants } from "src/utils/constants";
import { TestDTO } from "./test.dto";
import { MongoInsertDTO } from "./mongoinsertdto";
import { ContactSyncDTO } from "./contactsycnDTO";
import { ContactRequestDTO } from "./contactRequestDTO";
import { ContactInsertDTO } from "./contactInsertDto";
import { ContactNewDoc } from "src/multiple-number-search/cotactsNewDoc";
import { ContactDocument } from "./contactInsertDocument";
const hash = require('crypto').createHash;


const worker = require("workerpool");
// const sm = require('./worker/serviceHelper.js')
declare function require(name:string);
var workerpool = require('workerpool');

export class ContactService {
    // constructor(@InjectModel("Contact") private readonly contactModel: Model<Contact>,
    // @InjectModel("Indiaprefixlocationmaps") private readonly carrierInfoModel: Model<Indiaprefixlocationmaps>) { }
    constructor(@Inject('DATABASE_CONNECTION') private db:Db) { }
   
   
    
    
           
       

 

    async getCarrierInfo(firstNDigitsToGetCarrierInfo: string, countryCode:number, countryISO:string):Promise<Indiaprefixlocationmaps> {
        firstNDigitsToGetCarrierInfo = firstNDigitsToGetCarrierInfo.replace("(","")
        firstNDigitsToGetCarrierInfo = firstNDigitsToGetCarrierInfo.replace(")","")
    console.log(`searching for carrier info : ${firstNDigitsToGetCarrierInfo}`)

    let info:Indiaprefixlocationmaps = await CarrierService.getInfo(firstNDigitsToGetCarrierInfo,this.db, countryCode, countryISO)
    
    
    return info;


  }
  initFields(cntct:ContactInsertDTO){
    let ob:SpammerStatus = Object.create(null);
    ob.spamCount = 0;
    ob.spammer = false;
    cntct.spammerStatus = ob;
    cntct.carrier = ""
    cntct.line_type = "" 
    cntct.location = ""
    cntct.country = ""
    cntct.line_type = ""

}
  
/**
 * db.users.update({name:"jithinn"}, {$set:{age:23}}, {upsert:true})
 *  bulk.find({name:"jithin"}).upsert().updateOne({$setOnInsert:{"age":2}, $set:{"new":"idk"} });
 *  bulk.find({name:"jithin"}).upsert().updateOne({$setOnInsert:{"age":2}, $set:{"new":"idk"} });
 * @param contacts contacts in request body to be saved in database
 */
  async uploadBulk(contacts:ContactRequestDTO[], countryCode:number, countryISO:string){
      console.log("inside upload bule contactservice")
      const bulkOp = await this.db.collection("contactsOfUser").initializeUnorderedBulkOp()
     const contactsWithCarrierInfo: ContactDocument[] = []
      let contactdto:ContactInsertDTO 
        // let arr = await Promise.allSettled(contacts.map(async contact=>
        let arr = await Promise.allSettled(contacts.map(async contact=>{
        let firstNDigitsToGetCarrierInfo = ""
        try{
             contactdto = new ContactInsertDTO();
            contactdto.phoneNumber = contact.phoneNumber.replace("*","").replace("#", "").trim()
            contactdto.firstNDigits = contact.firstNDigits;
            contactdto.name = contact.name;
            this.initFields(contactdto);
            firstNDigitsToGetCarrierInfo = contact.firstNDigits
           const [hashedPhone, carrierInfo] = await Promise.allSettled(
                [
                    this.getHashedPhonenNum(contactdto.phoneNumber),
                    this.getCarrierInfo(firstNDigitsToGetCarrierInfo, countryCode, countryISO)
                ]
                )
                
            let ob:SpammerStatus = Object.create(null);
            ob.spamCount = 0;
            ob.spammer = false;
    
            contactdto.spammerStatus = ob;
            contactdto.spammerStatus.spamCount = 0;
            
            let document = new ContactDocument();


            if(carrierInfo.status === "fulfilled"  && carrierInfo.value != undefined && carrierInfo!=null){
                contactdto.carrier = carrierInfo.value.carrier.trim();
                contactdto.line_type = carrierInfo.value.lineType.trim();
                contactdto.location = carrierInfo.value.location.trim();

            
    
                document.carrier = carrierInfo.value.carrier.trim();
                document.lineType = carrierInfo.value.lineType.trim()
                document.location = carrierInfo.value.location.trim();
                document.spammCount = 0
            }
            if(hashedPhone.status == "fulfilled"){
                contactdto.phoneNumber = hashedPhone.value
                contactdto._id = hashedPhone.value

                document._id = hashedPhone.value
                document.name = contact.name

            }   

            if(carrierInfo.status === "fulfilled" && hashedPhone.status == "fulfilled" ){
            
            
                contactsWithCarrierInfo.push(document);
            }

        }catch(e){
            console.log(`${e} for phone no ${firstNDigitsToGetCarrierInfo}`)
        }
       
    }))
    console.log(arr)
    for await(const c of contactsWithCarrierInfo){
        bulkOp.insert(c)
    }

    // for(let contactdto of arr){
    //     const doc = new ContactDocument()
    //     doc._id = contactdto._id;
    //     doc.carrier= contactdto.carrier;
    //     doc.country = contactdto.country;
    //     doc.lineType = contactdto.line_type;
    //     doc.location = contactdto.location;
    //     doc.name = contactdto.name;
    //     doc.phoneNumber = contactdto.phoneNumber;
    //     doc.spammCount = contactdto.spammerStatus.spamCount;

    //     bulkOp.insert(doc)
    // }
       
    console.log("performing  bulk insert contactservice")
    try{
        bulkOp.execute()
    }catch(e){
        console.log(`bulk insert contacts error ${e}`)
    }
   

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
        console.log("migrating")
        const bulktInsert = await this.db.collection("testcollection").initializeUnorderedBulkOp()
        const res : MongoInsertDTO[]= [{_id:"1", location:"kerala"}, {_id:"2", location:"banglore"}, {_id:"3", location:"delhi"}] 
        for await(const contact of res){
            const obj = new MongoInsertDTO()
            obj._id = contact._id
            obj.location = contact.location
            bulktInsert.insert(obj)

            console.log("inserting")
        }
        bulktInsert.execute();
    }
   
}
      

    

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