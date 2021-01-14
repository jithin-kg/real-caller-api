import { Inject, Injectable } from '@nestjs/common';
import { rejects } from 'assert';
import { Collection, Cursor, Db } from 'mongodb';
import { ContactDto, SpammerStatus } from 'src/contact/contact.dto';
import { CollectionNames } from 'src/db/collection.names';
import { NumberTransformService } from 'src/utils/numbertransform.service';
import { ContactReturnDto } from './contactReturn.dto';
import { ContactNewDoc } from './cotactsNewDoc';
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
    async getDetailsForNumbers(phoneNumbers: RequestDTO): Promise<Array<string>> {
        const arrayOfHahsedNums:string[] = phoneNumbers.hashedPhoneNum
        let resultArray:ContactReturnDto[]

       let arrWithSearchResults =  await this.processTheArray(arrayOfHahsedNums)
       console.log(arrWithSearchResults)
        return 
    }

    async processTheArray(arrayOfHahsedNums: string[]){
        let resultArray:ContactReturnDto[] = []

        return new Promise(async (resolve, rejects)=>{
            for await( const hashedNum of arrayOfHahsedNums){
                try{
                    
                   let rehasehdNum = await  this.numberTranformService.tranforNum(hashedNum)
                   rehasehdNum = rehasehdNum.trim();                   
                   const contactInfoFromDb:ContactNewDoc = await this.db.collection("contactsNew").findOne({phoneNumber: rehasehdNum})
                   if(contactInfoFromDb !=null){
                        const ob = new ContactReturnDto()
                        ob.hashOne = hashedNum
                        ob.hashTwo = contactInfoFromDb.phoneNumber
                        
                        let nestedOb:SpammerStatus = Object.create(null);
                        nestedOb.spamCount = 0;
                        nestedOb.spammer = false;
                        ob.spammerStatus = nestedOb
                        ob.spammerStatus.spamCount = contactInfoFromDb.spammerStatus.spamCount
                        ob.name = contactInfoFromDb.name
                        
                        resultArray.push(ob)
                        // ob.carrier = rehasehdNum.carr

                   } 
                }catch(e){
                    console.log(`error while processing multiplenumbersearchservice \n`)
                    console.log(e);
                    rejects(e)
        
                }
                resolve(resultArray)
            }
       
        })
    }
}
