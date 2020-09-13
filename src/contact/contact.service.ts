import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Contact } from "./contact.schema";
import { ContactDto } from "./contact.dto";
import { Indiaprefixlocationmaps } from "src/carrierService/carrier.info.schema";
import { CarrierService } from "src/carrierService/carrier.service";
import { parsePhoneNumberFromString } from "libphonenumber-js";

const worker = require("workerpool");
// const sm = require('./worker/serviceHelper.js')
declare function require(name:string);
var workerpool = require('workerpool');

export class ContactService {
    constructor(@InjectModel("Contact") private readonly contactModel: Model<Contact>,
    @InjectModel("Indiaprefixlocationmaps") private readonly carrierInfoModel: Model<Indiaprefixlocationmaps>) { }
    async upload(contacts:ContactDto[]){
       
        let savedContact
        await  contacts.forEach(async cntct=>{
            try{
                let numWithGeoInfo = parsePhoneNumberFromString(cntct.phoneNumber)
                let phoneNum = numWithGeoInfo.number.toString()
                let carrierInfo = await this.getCarrierInfo(phoneNum) 
                
                console.log("geo num"+numWithGeoInfo)
                console.log("carrier info "+carrierInfo)
                if(carrierInfo  && numWithGeoInfo && phoneNum){
                    //todo replace all - and spaces from phone numbe
                    cntct.carrier = carrierInfo.carrier;
                    cntct.line_type = carrierInfo.line_type;
                    cntct.location = carrierInfo.location;
                    cntct.country = numWithGeoInfo.country;
                    cntct.phoneNumber = phoneNum;
                    

                   try{
                    let contactInfoFromDb =  await this.contactModel.findOne({phoneNumber:phoneNum})
                    console.log("contact fetched is "+ contactInfoFromDb);
                    if(!contactInfoFromDb){
                        let contactObj = new this.contactModel(cntct)
                        savedContact = await contactObj.save()
                        console.log(savedContact);
                    }
                   }catch(e){
                       console.log("error while fetching "+e)
                   }
                    // console.log("carrier info fetched "+carrierInfo);
                    // let contactObj = new this.contactModel(cntct)
                    // savedContact = await contactObj.save()
                    // console.log(savedContact);
                    console.log(cntct);
                }
               
                
            }catch(e){
                console.log("error while saving" +e);
            }
            
        })
            return savedContact;
        }
           
       

 

    async getCarrierInfo(phoneNumber: string):Promise<Indiaprefixlocationmaps> {
    
    let info:Indiaprefixlocationmaps = await CarrierService.getInfo(phoneNumber, this.carrierInfoModel)
        
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
  
