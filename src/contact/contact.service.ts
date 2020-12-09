import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Contact } from "./contact.schema";
import { ContactDto } from "./contact.dto";
import {SpammerStatus} from './contact.dto';
import { Indiaprefixlocationmaps } from "src/carrierService/carrier.info.schema";
import { CarrierService } from "src/carrierService/carrier.service";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { ContactController } from "./contact.controller";
import { Inject } from "@nestjs/common";
import { Db } from "mongodb";
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
  
