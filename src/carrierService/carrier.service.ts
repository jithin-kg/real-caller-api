
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
            let info: Indiaprefixlocationmaps
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

                const country = new awesomePhonenumber(firstNDigitsToGetCarrierInfo).getRegionCode()
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

                    info = await db.collection(Constants.COLLECTION_NUMBER_PREFIX_GEOINGO).findOne({_id: {$regex: new RegExp(firstNDigitsToGetCarrierInfo)}}) //phoneNumWithLocalRegionCode
                    // info =  await db.collection(Constants.COLLECTION_NUMBER_PREFIX_GEOINGO).findOne({_id:"9163663"}) //phoneNumWithLocalRegionCode
                    resolve(info)

                } else if (country != null && country != countryISO) {
                    const phoneUtil = googlePhoneLib.PhoneNumberUtil.getInstance();
                    firstNDigitsToGetCarrierInfo = firstNDigitsToGetCarrierInfo.replace("+", "").trim()
                    const res = phoneUtil.isValidNumberForRegion(phoneUtil.parse(firstNDigitsToGetCarrierInfo, countryISO), countryISO);
                    if (res) {
                        CarrierService.prefix = firstNDigitsToGetCarrierInfo.trim().replace("+", "").substr(0, 7);
                        let prefixForComparing = countryCode + firstNDigitsToGetCarrierInfo
                        prefixForComparing = prefixForComparing.replace("+", "").substr(0, 7).trim()
                        info = await db.collection(Constants.COLLECTION_NUMBER_PREFIX_GEOINGO).findOne({_id: {$regex: new RegExp(prefixForComparing)}})
                        resolve(info)
                        countryCodeForInsertingInDB = countryISO;
                    } else {
                        firstNDigitsToGetCarrierInfo = firstNDigitsToGetCarrierInfo.replace("+", "").substr(0, 7).trim();
                        info = await db.collection(Constants.COLLECTION_NUMBER_PREFIX_GEOINGO).findOne({_id: {$regex: new RegExp(firstNDigitsToGetCarrierInfo)}})
                        console.log(info)
                        resolve(info)
                    }

                } else {
                    firstNDigitsToGetCarrierInfo = firstNDigitsToGetCarrierInfo.replace("+", "").substr(0, 7).trim();
                    info = await db.collection(Constants.COLLECTION_NUMBER_PREFIX_GEOINGO).findOne({_id: {$regex: new RegExp(firstNDigitsToGetCarrierInfo)}})
                    console.log(info)
                    resolve(info)
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