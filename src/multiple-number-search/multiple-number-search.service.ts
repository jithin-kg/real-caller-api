import { Inject, Injectable } from '@nestjs/common';
import { rejects } from 'assert';
import { Collection, Cursor, Db } from 'mongodb';
import { resolve } from 'path';
import { ContactDto, SpammerStatus } from 'src/contact/contact.dto';
import { CollectionNames } from 'src/db/collection.names';
import { NumberTransformService } from 'src/utils/numbertransform.service';
import { ContactAdderssWithHashedNumber } from './contactAddressWithHashedNumDTO';
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
    async rehashArrayItems(arrayOfHahsedNums: ContactAdderssWithHashedNumber[]) : Promise<RehashedItemWithOldHash[]>{
        let resultArray:RehashedItemWithOldHash[] = []
    
        return new Promise(async (resolve, rejects)=>{
            for await(const hashedNum of arrayOfHahsedNums){
                try{
                   let rehasehdNum = await  this.numberTranformService.tranforNum(hashedNum.contactAddressHashed)
                   const obj = new RehashedItemWithOldHash()
                   obj.phoneNumber = hashedNum.contactAddressString;
                   obj.newHash = rehasehdNum
                    obj.firstName = "sample"
                    obj.spamCount = 0
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
                    // const contactInfoFromDb:ContactNewDoc = await this.db.collection("contactsOfUser").findOne({phoneNumber: })

                    const contactInfoFromDb:ContactNewDoc = await this.db.collection("contactsOfUser").findOne({_id: rehasehdNum.newHash})
                 
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
                        obj.firstName = contactInfoFromDb.firstName;
                        obj.lineType = contactInfoFromDb.line_type;
                        obj.phoneNumber = rehasehdNum.phoneNumber;
                        obj.newHash = ""
                        obj.spamCount = contactInfoFromDb.spamCount
                        
                        resultArray.push(obj)
                        // ob.carrier = rehasehdNum.carr

                   } else{
                       const obj = new RehashedItemWithOldHash()
                        obj.firstName = "";
                        obj.lineType = "";
                        obj.phoneNumber = rehasehdNum.phoneNumber;
                        obj.newHash = ""
                        obj.spamCount = 0
                       resultArray.push(obj)
                   }
                }catch(e){
                    console.log(`error multiplenumbersearchservice \n`,e )
                    rejects(e)
        
                }
            }

            resolve(resultArray)
       
        })
    }
}
