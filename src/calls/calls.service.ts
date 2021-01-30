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


@Injectable()
export class CallService {
    private collection:Collection
    constructor(@Inject('DATABASE_CONNECTION') private db:Db, private numberTranformService: NumberTransformService ) {
        this.collection = this.db.collection( CollectionNames.CONTACTS_COLLECTION);
   }
   /**
     * 
     * @param phoneNumbers 
     * @returns array containing contactdetails for each phone number
     * 
     */
    // async getDetailsForNumbers(phoneNumbers: RequestDTO): Promise<ContactReturnDto[]> {
        async getDetailsForNumbers(phoneNumbers: RequestDTO): Promise<RehashedItemWithOldHash[]> {
        const arrayOfHahsedNums:ContactAdderssWithHashedNumber[] = phoneNumbers.hashedPhoneNum
        let resultArray:ContactReturnDto[]
        
        let rehashedItems:RehashedItemWithOldHash[] = await this.rehashArrayItems(arrayOfHahsedNums)

       let arrWithSearchResults:RehashedItemWithOldHash[] =  await this.searchInDBForRehashedItems(rehashedItems)


    //    console.log(`multiple number searchresult ${arrWithSearchResults}`)
        // return arrWithSearchResults
        // let result:ContactReturnDto[] = []
        return arrWithSearchResults;
    }
    private async rehashArrayItems(arrayOfHahsedNums: ContactAdderssWithHashedNumber[]): Promise<RehashedItemWithOldHash[]>{
        let resultArray: RehashedItemWithOldHash[];
        resultArray = [];

        return new Promise(async (resolve, rejects)=>{
            for await(const hashedNum of arrayOfHahsedNums){
                try{
                   let rehasehdNum = await  this.numberTranformService.tranforNum(hashedNum.contactAddressHashed)
                   const obj = new RehashedItemWithOldHash()
                   obj.phoneNumber = hashedNum.contactAddressString;
                   obj.newHash = rehasehdNum
                    obj.name = "sample"
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
        } )
            
        
    }
    
    async searchInDBForRehashedItems(arrayOfHahsedNums: RehashedItemWithOldHash[]) : Promise<RehashedItemWithOldHash[]>{
        let resultArray:RehashedItemWithOldHash[] = []

        return new Promise(async (resolve, rejects)=>{
            for await( const rehasehdNum of arrayOfHahsedNums){
                try{
                                   
                    console.log(`searching in db rehasehdNum is ${rehasehdNum}`)
                   const contactInfoFromDb:ContactNewDoc = await this.db.collection("contactsNew").findOne({phoneNumber: rehasehdNum.newHash})
                   if(contactInfoFromDb !=null){
                        // const ob = new ContactReturnDto()
                        // ob.hashOne = rehasehdNum.oldHash
                        // ob.hashTwo = contactInfoFromDb.phoneNumber
                        
                        // let nestedOb:SpammerStatus = Object.create(null);
                        // nestedOb.spamCount = 0;
                        // nestedOb.spammer = false;
                        // ob.spammerStatus = nestedOb
                        // ob.spammerStatus.spamCount = contactInfoFromDb.spammerStatus.spamCount
                        // ob.name = contactInfoFromDb.name

                        const obj = new RehashedItemWithOldHash()
                        obj.name = contactInfoFromDb.name;
                        obj.lineType = contactInfoFromDb.line_type;
                        obj.phoneNumber = rehasehdNum.phoneNumber;
                        obj.newHash = ""
                        obj.spamCount = contactInfoFromDb.spammerStatus.spamCount
                        
                        resultArray.push(obj)
                        // ob.carrier = rehasehdNum.carr

                   } else{
                       console.log("not found in db")
                       const obj = new RehashedItemWithOldHash()
                        obj.name = "";
                        obj.lineType = "";
                        obj.phoneNumber = rehasehdNum.phoneNumber;
                        obj.newHash = ""
                        obj.spamCount = 0
                       resultArray.push(obj)
                   }
                }catch(e){
                    console.log(`error while processing multiplenumbersearchservice \n`)
                    console.log(e);
                    rejects(e)
        
                }
            }

            resolve(resultArray)
       
        })
    }
}
