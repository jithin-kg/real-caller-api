import { Inject, Injectable } from '@nestjs/common';
import { rejects } from 'assert';
import { Collection, Cursor, Db } from 'mongodb';
import { resolve } from 'path';
import { ContactDto, SpammerStatus } from 'src/contact/contact.dto';
import {CollectionNames} from "../db/collection.names";
import {RequestDTO} from "../multiple-number-search/requestDTO";
import {RehashedItemWithOldHash} from "../multiple-number-search/RehashedItemwithOldHash";
import {ContactReturnDto} from "../multiple-number-search/contactReturn.dto";
import {ContactAdderssWithHashedNumber} from "../multiple-number-search/contactAddressWithHashedNumDTO";
import {NumberTransformService} from "../utils/numbertransform.service";
import {ContactNewDoc} from "../multiple-number-search/cotactsNewDoc";
import {Constants} from "./Constatns";
import { GenericServiceResponseItem } from 'src/utils/Generic.ServiceResponseItem';



@Injectable()
export class CallService {
    private collection:Collection
    constructor(@Inject('DATABASE_CONNECTION') private db:Db,
     private numberTranformService: NumberTransformService
      ) {

    
        this.collection = this.db.collection( CollectionNames.CONTACTS_COLLECTION);
   }
   /**
     * 
     * @param phoneNumbers 
     * @returns array containing contactdetails for each phone number
     * 
     */
    // async getDetailsForNumbers(phoneNumbers: RequestDTO): Promise<ContactReturnDto[]> {
        /**
        *
        * @param phoneNumbers for handling request to get informatoin for call log data
        */
        async getDetailsForNumbers(phoneNumbers: RequestDTO): Promise<GenericServiceResponseItem<RehashedItemWithOldHash[]>> {
            let resultArray:ContactReturnDto[]
            
            try {
                const arrayOfHahsedNums:ContactAdderssWithHashedNumber[] = phoneNumbers.hashedPhoneNum
                let rehashedItems:RehashedItemWithOldHash[] = await this.rehashArrayItems(arrayOfHahsedNums)
                let arrWithSearchResults:RehashedItemWithOldHash[] =  await this.searchInDBForRehashedItems(rehashedItems)
            return GenericServiceResponseItem.returnGoodResponse(arrWithSearchResults);
            }catch(e){
                return GenericServiceResponseItem.returnServerErrRes()
                console.log(`Exception while getdetailsfronumber${e}`)
            }
        }
    private async rehashArrayItems(arrayOfHahsedNums: ContactAdderssWithHashedNumber[]): Promise<RehashedItemWithOldHash[]>{
        let resultArray: RehashedItemWithOldHash[];
        resultArray = [];

        return new Promise(async (resolve, rejects)=>{
            Promise.resolve().then(async res=> { // this is important otherwise, return promise will wait for the whole loop to finish  
                for await(const hashedNum of arrayOfHahsedNums){
                    try{
                       let rehasehdNum = await  this.numberTranformService.tranforNum(hashedNum.contactAddressHashed)
                       const obj = new RehashedItemWithOldHash()
                       obj.phoneNumber = hashedNum.contactAddressHashed;
                       obj.newHash = rehasehdNum   
                        obj.firstName = ""
                        obj.spamCount = 0
                     console.log("--------------------hash ------------------------")
                       console.log(rehasehdNum)
                       console.log("--------------------end hash ------------------------")
                       if(rehasehdNum !=null){
    
                            resultArray.push(obj)
                       }
                    }catch(e){
                        console.log(`rehashArrayItems ${e}`)
                        rejects(e)
                    }
                }
                resolve(resultArray)
            })
            
        } )
            
        
    }
    
    async searchInDBForRehashedItems(arrayOfHahsedNums: RehashedItemWithOldHash[]) : Promise<RehashedItemWithOldHash[]>{
        let resultArray:RehashedItemWithOldHash[] = []

        return new Promise(async (resolve, rejects)=>{
            Promise.resolve().then(async res=> {
                for await( const rehasehdNum of arrayOfHahsedNums){
                    try{
                                       
                        console.log(`searching in db rehasehdNum is ${rehasehdNum}`)
                       const contactInfoFromDb:ContactNewDoc = await this.db.collection("contactsOfUser").findOne({_id: rehasehdNum.newHash})
                       if(contactInfoFromDb !=null){
                            const obj = new RehashedItemWithOldHash()
                            obj.firstName = contactInfoFromDb.firstName;
                            obj.lastName = contactInfoFromDb.lastName
                            obj.lineType = contactInfoFromDb.line_type;
                            obj.phoneNumber = rehasehdNum.phoneNumber;
                            obj.newHash = ""
                            obj.spamCount = contactInfoFromDb.spamCount
                            obj.isInfoFoundInDb = Constants.INFO_FOUND_ID_DB
                            obj.imageThumbnail = contactInfoFromDb.image
                            obj.hUid = contactInfoFromDb?.huid
                            resultArray.push(obj)
                            // ob.carrier = rehasehdNum.carr
    
                       } else{
                           console.log("not found in db")
                           const obj = new RehashedItemWithOldHash()
                            obj.firstName = "";
                            obj.lineType = "";
                            obj.phoneNumber = rehasehdNum.phoneNumber;
                            obj.newHash = ""
                            obj.spamCount = 0
                           obj.isInfoFoundInDb = Constants.INFO_NOT_FOUND_IND_DB
                           obj.imageThumbnail = ""
                           resultArray.push(obj)
                       }
                    }catch(e){
                        console.log(`error while processing multiplenumbersearchservice ${e}`)
                        rejects(e)
    
                    }
                }
                resolve(resultArray)
            })
            

            
       
        })
    }
}
