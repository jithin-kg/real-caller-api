
import { Indiaprefixlocationmaps } from "./carrier.info.schema";
import { parsePhoneNumberFromString } from 'libphonenumber-js'
import { CarrierInfoDTO } from "./carrier.info.dto";
import { HttpException } from "@nestjs/common";
import { Db } from "mongodb";
import awesomePhonenumber, * as awsomePhoneNumber from "awesome-phonenumber"
import { Constants } from "src/utils/constants";
import * as chalk from "chalk";

import * as googlePhoneLib from "google-libphonenumber" ;
import { isNotEmpty } from "class-validator";

export class CarrierService{
    static prefix:string

    /**
     * function that returns carrier information for a number
     * @param firstNDigitsToGetCarrierInfo this is currently the full phone number of the user
     * we need full phone number to identify the country of that number
     * @param db
     * @param countryCode
     * @param countryISO
     */
    static  getInfo(firstNDigitsToGetCarrierInfo:string, db:Db, countryCode: number, countryISO:string) : Promise<Indiaprefixlocationmaps>{
        return new Promise((async (resolve, reject) => {
            let info: Indiaprefixlocationmaps = new Indiaprefixlocationmaps()
            let countryCodeForInsertingInDB = ""
            /**
             * for awsome phone number to auto-detect the country we need + in the begining
             *
             */
            //todo while saving prefixlocaionmapping in database/api I need to add the coutry also,
            //then only we know which coutry is the prefix belongs to and update data accordingly

            try {
                if (firstNDigitsToGetCarrierInfo != null)
                    if (firstNDigitsToGetCarrierInfo.length > 2)
                        if (firstNDigitsToGetCarrierInfo[0] != "+") {
                            firstNDigitsToGetCarrierInfo = "+" + firstNDigitsToGetCarrierInfo
                        }
                 const awsomePhoneNum = new awesomePhonenumber(firstNDigitsToGetCarrierInfo)
                const country = awsomePhoneNum.getRegionCode()
                if(countryCode==undefined || isNaN(countryCode)){
                    const codeHelper = new awesomePhonenumber(firstNDigitsToGetCarrierInfo,country )
                    countryCode =codeHelper.getCountryCode()
                }

                if(countryISO!= ""){
                    info.country = countryISO
                }else {
                    info.country = country
                }
                const numWithoutSpecialchars = firstNDigitsToGetCarrierInfo.replace("+", "")
                const isNumPrefixStartsWithcoutryCode = numWithoutSpecialchars.startsWith(countryCode.toString())
                

                if (country == countryISO) {
                    CarrierService.prefix = firstNDigitsToGetCarrierInfo.trim().replace("+", "").substr(0, 7);
                    if (firstNDigitsToGetCarrierInfo != null)
                        if (firstNDigitsToGetCarrierInfo.length > 0)
                            firstNDigitsToGetCarrierInfo = firstNDigitsToGetCarrierInfo.trim().replace("+", "").substr(0, 7);
                    //in the case of india the first two digits are country code and the rest
                    const phoneNumWithLocalRegionCode = firstNDigitsToGetCarrierInfo.substring(0, 7)
                    // console.log("prefix is "+ CarrierService.prefix)
                    //  info =  await carrierInfoModel.findOne({prefix:CarrierService.prefix})
                    //  info =  await db.collection('indiaprefixlocationmaps').findOne({prefix:`%${CarrierService.prefix}%`})

                    const infoFromDb = await db.collection(Constants.COLLECTION_NUMBER_PREFIX_GEOINGO).findOne({_id: {$regex: new RegExp(firstNDigitsToGetCarrierInfo)}}) //phoneNumWithLocalRegionCode
                    // info =  await db.collection(Constants.COLLECTION_NUMBER_PREFIX_GEOINGO).findOne({_id:"9163663"}) //phoneNumWithLocalRegionCode
                        
                    if(infoFromDb!=undefined){
                        resolve(infoFromDb)
                    }else{
                        resolve(info)
                    }

                } else if (country != null && country != countryISO) {
                    const phoneUtil = googlePhoneLib.PhoneNumberUtil.getInstance();
                    firstNDigitsToGetCarrierInfo = firstNDigitsToGetCarrierInfo.replace("+", "").trim()
                   let res = false
                    if(countryISO!=""){
                     res = phoneUtil.isValidNumberForRegion(phoneUtil.parse(firstNDigitsToGetCarrierInfo, countryISO), countryISO);

                   }else{
                     res = phoneUtil.isValidNumberForRegion(phoneUtil.parse(firstNDigitsToGetCarrierInfo, country), country);
                   }
                    if (res) {
                        CarrierService.prefix = firstNDigitsToGetCarrierInfo.trim().replace("+", "").substr(0, 7);
                        let prefixForComparing = ""
                        if(!isNumPrefixStartsWithcoutryCode){
                             prefixForComparing = countryCode + firstNDigitsToGetCarrierInfo

                        }else{
                            prefixForComparing = numWithoutSpecialchars
                        }
                        prefixForComparing = prefixForComparing.replace("+", "").substr(0, 7).trim()
                        const infoFromDb = await db.collection(Constants.COLLECTION_NUMBER_PREFIX_GEOINGO).findOne({_id: {$regex: new RegExp(prefixForComparing)}})
                        if(infoFromDb!=undefined){
                            resolve(infoFromDb)
                        }else{
                            resolve(info)
                        }
                        
                        countryCodeForInsertingInDB = countryISO;
                    } else {
                        firstNDigitsToGetCarrierInfo = firstNDigitsToGetCarrierInfo.replace("+", "").substr(0, 7).trim();
                        const infoFromDb = await db.collection(Constants.COLLECTION_NUMBER_PREFIX_GEOINGO).findOne({_id: {$regex: new RegExp(firstNDigitsToGetCarrierInfo)}})
                        console.log(info)
                        if(infoFromDb!=undefined){
                            resolve(infoFromDb)
                        }else{
                            resolve(info)
                        }
                    }

                } else {
                    firstNDigitsToGetCarrierInfo = firstNDigitsToGetCarrierInfo.replace("+", "").substr(0, 7).trim();
                    const infoFromDb = await db.collection(Constants.COLLECTION_NUMBER_PREFIX_GEOINGO).findOne({_id: {$regex: new RegExp(firstNDigitsToGetCarrierInfo)}})
                    console.log(info)
                    if(infoFromDb!=undefined){
                        resolve(infoFromDb)
                    }else{
                        resolve(info)
                    }
                }
                //todo check other countries as well
                //if nothing matches check in the users table and check if the user belong to which country
                //or i need to findout a way to identify from client from which country a call comming
                //or i need to save all nations region code in one collection
                //and if no coutry detected search as it is


                //  console.log(CarrierService.prefix+":info in carrierservice "+info );
            } catch (e) {
                reject(e)
                console.log(chalk.red(`error while getting carrierinfo ${e} `))

            }
            // if(info != null )
            // return info
        }))

    }   
}