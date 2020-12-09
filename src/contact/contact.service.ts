import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Contact } from "./contact.schema";
import { ContactDto } from "./contact.dto";
import {SpammerStatus} from './contact.dto';
import { Indiaprefixlocationmaps } from "src/carrierService/carrier.info.schema";
import { CarrierService } from "src/carrierService/carrier.service";
import { parsePhoneNumberFromString, PhoneNumber } from "libphonenumber-js";
import { ContactController } from "./contact.controller";
import { Inject } from "@nestjs/common";
import { Db } from "mongodb";
import { CarrierInfoDTO } from "src/carrierService/carrier.info.dto";
const hash = require('crypto').createHash;


const worker = require("workerpool");
// const sm = require('./worker/serviceHelper.js')
declare function require(name:string);
var workerpool = require('workerpool');

export class ContactService {
    // constructor(@InjectModel("Contact") private readonly contactModel: Model<Contact>,
    // @InjectModel("Indiaprefixlocationmaps") private readonly carrierInfoModel: Model<Indiaprefixlocationmaps>) { }
    constructor(@Inject('DATABASE_CONNECTION') private db:Db) { }
   
    initFields(cntct:ContactDto){
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
    
    async upload(contacts:ContactDto[]) :Promise<ContactDto[]>{
        
       
       let contactsArrWithCarrierInfo:ContactDto []=  await this.getContactWithHashedInfo(contacts)
        for(let i =0; i<contactsArrWithCarrierInfo.length; i++){
            console.log("inserting " , contactsArrWithCarrierInfo[i])
            let reslt = await this.db.collection('contactsNew').insertOne(contactsArrWithCarrierInfo[i])
            console.log(`Inserted contact ${reslt}`)
        }
        
       
            return contactsArrWithCarrierInfo;

        }
           
       

 

    async getCarrierInfo(phoneNumber: string):Promise<Indiaprefixlocationmaps> {
    phoneNumber = phoneNumber.replace("(","")
    phoneNumber = phoneNumber.replace(")","")
    let info:Indiaprefixlocationmaps = await CarrierService.getInfo(phoneNumber,this.db)

        
    return info;


  }

  async getContactWithHashedInfo(contacts:ContactDto[]) :Promise<ContactDto[]>{
    let contactsArrWithCarrierInfo:ContactDto[] = [];
    let savedContact
    return  new Promise(async(resolve, reject)=>{
        for await(const cntct of contacts){ 
            try{
                this.initFields(cntct);
                //TODO  check the phone number start with + 
                let numForLookup = cntct.phoneNumber.trim()
                numForLookup = numForLookup.replace("+", "")
                //todo replace (and ) with ''

                if(numForLookup[0] != "9" && numForLookup[1] != "1"){
                    // numForLookup = numForLookup.slice(2,numForLookup.length)
                    numForLookup = "+91"+numForLookup
                }
                
                let numWithGeoInfo = await parsePhoneNumberFromString(numForLookup)
    
                let phoneNum = numWithGeoInfo.number.toString();
                let phoneNumForHashing = phoneNum.replace('+',"");
                let hashedPhone = await hash('sha256').update(phoneNumForHashing).digest('base64');
                
                console.log('hashed phone number is ',hashedPhone);
    
    
                // try{
                    let contactInfoFromDb =  await this.db.collection('contactsNew').findOne({phoneNumber:hashedPhone})
                    console.log("contact fetched is ", contactInfoFromDb);
                    if(contactInfoFromDb== null){
                        // let contactObj = new this.contactModel(cntct)
                        /**
                         * If the current number not in databse then get carrier information
                         * and push it into array for later saving into database
                         * 
                         */
                        let carrierInfo = await this.getCarrierInfo(numForLookup) 
                
                        console.log("geo num"+numWithGeoInfo)
                        console.log("carrier info "+carrierInfo)
                        
                        let ob:SpammerStatus = Object.create(null);
                        ob.spamCount = 0;
                        ob.spammer = false;
                        
                        if(carrierInfo  && numWithGeoInfo && phoneNum){
                            //todo replace all - and spaces from phone numbe
                           cntct.spammerStatus = ob;
                            cntct.spammerStatus.spamCount = 0;
                            cntct.carrier = carrierInfo.carrier.trim();
                            cntct.line_type = carrierInfo.line_type.trim();
                            cntct.location = carrierInfo.location.trim();
                            cntct.country = numWithGeoInfo.country;
                            cntct.phoneNumber = hashedPhone.trim();
                            
                            // cntct.spammerStatus.spammer = "false";
                              
                        
                                                      
                        }
                        contactsArrWithCarrierInfo.push(cntct);
                        // contactsArrWithCarrierInfo.push({"insertOne":{"document":cntct}});
                       
                      
    
                    }else{
                        console.log("alredy exising");
                    }
                //    }catch(e){
                //        console.log("error while fetching "+e)
                //    }
                
            }catch(e){
                reject(e)
                console.log("error while saving" ,e);
            }
    
        }
        
        return resolve(contactsArrWithCarrierInfo)
    })
    
  }
/**
 * db.users.update({name:"jithinn"}, {$set:{age:23}}, {upsert:true})
 *  bulk.find({name:"jithin"}).upsert().updateOne({$setOnInsert:{"age":2}, $set:{"new":"idk"} });
 *  bulk.find({name:"jithin"}).upsert().updateOne({$setOnInsert:{"age":2}, $set:{"new":"idk"} });
 * @param contacts 
 */
  async uploadBulk(contacts:ContactDto[]){
      const bulkOp = await this.db.collection("sampleCollections").initializeUnorderedBulkOp()
     
    let arr = await Promise.allSettled(contacts.map(async contact=>{
        let numForLookup = ""
        try{
            this.initFields(contact);
             numForLookup = this.getPreparedNumForLookup(contact.phoneNumber)    
            let numWithGeoInfo = await parsePhoneNumberFromString(numForLookup)
            //get hashed phone number
            let phoneNum = "";
            if(numWithGeoInfo!= null){
                phoneNum = numWithGeoInfo.number.toString();
            }
        
            let phoneNumForHashing = phoneNum.replace('+',"");
            // let hashedPhone = await hash('sha256').update(phoneNumForHashing).digest('base64')
            // let hashedPhone = await this.getHashedPhonenNum(phoneNumForHashing);
           
            // let carrierInfo = await this.getCarrierInfo(numForLookup) 

            // Promise.allSetteled is used for parellel execution
            //promise.all() fails if one of the promise in array fails
            //but Promise.allsetteled() does not fail if one of the item fails
           const [hashedPhone, carrierInfo] = await Promise.allSettled(
                [
                    this.getHashedPhonenNum(phoneNumForHashing),
                    this.getCarrierInfo(numForLookup)
                ]
                )
                
            let ob:SpammerStatus = Object.create(null);
            ob.spamCount = 0;
            ob.spammer = false;
    
            contact.spammerStatus = ob;
            contact.spammerStatus.spamCount = 0;
            if(carrierInfo.status === "fulfilled"  && carrierInfo.value != undefined){
                contact.carrier = carrierInfo.value.carrier.trim();
                contact.line_type = carrierInfo.value.line_type.trim();
                contact.location = carrierInfo.value.location.trim();
            
            }
            if(hashedPhone.status == "fulfilled"){
                contact.phoneNumber = hashedPhone.value

            contact.phoneNumber = hashedPhone.value
            }
            if(numWithGeoInfo!=null){
                contact.country = numWithGeoInfo.country;
            }

            
        }catch(e){
            console.log(`${e} for phone no ${numForLookup}`)
        }
       

         bulkOp.find({phoneNum:contact.phoneNumber}).upsert().updateOne({$setOnInsert:contact})
    })).catch(e=>{
        console.log(e)
    })

    bulkOp.execute().then(data=>{
        console.log(data)
    }).catch(e=>{
        console.log(e)
    })

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
  

    