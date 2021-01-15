import { Inject, Injectable } from '@nestjs/common';
import { rejects } from 'assert';
import { Collection, Cursor, Db } from 'mongodb';
import { resolve } from 'path';
import { ContactDto, SpammerStatus } from 'src/contact/contact.dto';
import { CollectionNames } from 'src/db/collection.names';
import { NumberTransformService } from 'src/utils/numbertransform.service';
import { ContactReturnDto } from './contactReturn.dto';
import { ContactNewDoc } from './cotactsNewDoc';
import { RehashedItemWithOldHash } from './RehashedItemwithOldHash';
import { RequestDTO } from './requestDTO';

@Injectable()
export class MultipleNumberSearchService {
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
    async getDetailsForNumbers(phoneNumbers: RequestDTO): Promise<ContactReturnDto[]> {
        const arrayOfHahsedNums:string[] = phoneNumbers.hashedPhoneNum
        let resultArray:ContactReturnDto[]
        
        let rehashedArrayItem = await this.rehashArrayItems(arrayOfHahsedNums)

       let arrWithSearchResults:ContactReturnDto[] =  await this.searchInDBForRehashedItems(rehashedArrayItem)

       console.log(`multiple number searchresult ${arrWithSearchResults}`)
        return arrWithSearchResults
    }
    async rehashArrayItems(arrayOfHahsedNums: string[]) : Promise<RehashedItemWithOldHash[]>{
        let resultArray:RehashedItemWithOldHash[] = []
    
        return new Promise(async (resolve, rejects)=>{
            for await(const hashedNum of arrayOfHahsedNums){
                try{
                   let rehasehdNum = await  this.numberTranformService.tranforNum(hashedNum)
                 console.log("--------------------hash ------------------------")
                   console.log(rehasehdNum) 
                   console.log("--------------------end hash ------------------------")
                   if(rehasehdNum !=null){
                       const obj = new RehashedItemWithOldHash()
                       obj.oldHash = hashedNum;
                       obj.newHash = rehasehdNum
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
    
    async searchInDBForRehashedItems(arrayOfHahsedNums: RehashedItemWithOldHash[]) : Promise<ContactReturnDto[]>{
        let resultArray:ContactReturnDto[] = []

        return new Promise(async (resolve, rejects)=>{
            for await( const rehasehdNum of arrayOfHahsedNums){
                try{
                                   
                    console.log(`searching in db rehasehdNum is ${rehasehdNum}`)
                   const contactInfoFromDb:ContactNewDoc = await this.db.collection("contactsNew").findOne({phoneNumber: rehasehdNum.newHash})
                   if(contactInfoFromDb !=null){
                        const ob = new ContactReturnDto()
                        ob.hashOne = rehasehdNum.oldHash
                        ob.hashTwo = contactInfoFromDb.phoneNumber
                        
                        let nestedOb:SpammerStatus = Object.create(null);
                        nestedOb.spamCount = 0;
                        nestedOb.spammer = false;
                        ob.spammerStatus = nestedOb
                        ob.spammerStatus.spamCount = contactInfoFromDb.spammerStatus.spamCount
                        ob.name = contactInfoFromDb.name
                        
                        resultArray.push(ob)
                        // ob.carrier = rehasehdNum.carr

                   } else{
                       console.log("not found in db")
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
