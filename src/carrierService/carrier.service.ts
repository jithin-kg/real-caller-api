
import { Indiaprefixlocationmaps } from "./carrier.info.schema";
import { parsePhoneNumberFromString } from 'libphonenumber-js'
import { CarrierInfoDTO } from "./carrier.info.dto";
import { HttpException } from "@nestjs/common";
import { Db } from "mongodb";

export class CarrierService{
    static prefix:string
    
    static async  getInfo(phoeNumber:string, db:Db) : Promise<Indiaprefixlocationmaps>{
        let info: Indiaprefixlocationmaps
        // console.log("inside fun")
        
        const num = parsePhoneNumberFromString(phoeNumber);
        // console.log("country is "+num.country);
        CarrierService.prefix = phoeNumber.trim().replace("+91","").substr(0, 5);

        
        try{
            // console.log("prefix is "+ CarrierService.prefix)
            //  info =  await carrierInfoModel.findOne({prefix:CarrierService.prefix})
             info =  await db.collection('indiaprefixlocationmaps').findOne({prefix:CarrierService.prefix})
            //  console.log(CarrierService.prefix+":info in carrierservice "+info );
        }catch(e){
            console.log("error while getting carrierinfo" + e)
        
        }
        if(info != null )
        return info
    }   
}