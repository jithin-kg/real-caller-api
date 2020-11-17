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
import * as sha1 from 'sha1';


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
        
        let contactsArrWithCarrierInfo:ContactDto[] = [];
        let savedContact
        for await(const cntct of contacts){
            try{
                this.initFields(cntct);
                //TODO  check the phone number start with + 
                let numWithGeoInfo = await parsePhoneNumberFromString("+"+cntct.phoneNumber)

                let phoneNum = numWithGeoInfo.number.toString();
                let phoneNumForHashing = phoneNum.replace('+',"");
                let hashedPhone = await sha1(phoneNumForHashing);
                
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
                        let carrierInfo = await this.getCarrierInfo(phoneNum) 
                
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
                            cntct.country = numWithGeoInfo.country.trim();
                            cntct.phoneNumber = hashedPhone.trim();
                            
                            // cntct.spammerStatus.spammer = "false";
                           
                                                      
                        }
                        // contactsArrWithCarrierInfo.push({"insertOne":{"document":cntct}});
                       
                        console.log("inserting " , cntct)
                        let reslt = await this.db.collection('contactsNew').insertOne(cntct)

                    }else{
                        console.log("alredy exising");
                    }
                //    }catch(e){
                //        console.log("error while fetching "+e)
                //    }
                   
                contactsArrWithCarrierInfo.push(cntct);
            }catch(e){
                console.log("error while saving" ,e);
            }
        }

        
       
            return contactsArrWithCarrierInfo;
        }
           
       

 

    async getCarrierInfo(phoneNumber: string):Promise<Indiaprefixlocationmaps> {
    
    let info:Indiaprefixlocationmaps = await CarrierService.getInfo(phoneNumber,this.db)

        
    return info;


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
  
