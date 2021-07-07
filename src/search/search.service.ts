import { Injectable, Inject, HttpException, HttpStatus } from "@nestjs/common";
import { Collection, Model } from 'mongoose'
import { Db } from "mongodb";
import { type } from "os";
import { CollectionNames } from "src/db/collection.names";
import * as bcryptjs from 'bcryptjs';
import {SearchResponseItem} from "./SearchResponseItem";
import {GenericServiceResponseItem} from "../utils/Generic.ServiceResponseItem";
import {Constants} from "../calls/Constatns";
import {ManualSearchDto} from "./manualSearch.dto";
import { HttpMessage } from "src/utils/Http-message.enum";
import { DatabaseModule } from "src/db/Database.Module";


const hash = require('crypto').createHash;
@Injectable()
export class SearchService {
   
     private collection;
    // constructor(@InjectModel("User") private readonly userModel: Model<User>) { }
    constructor(@Inject(DatabaseModule.DATABASE_CONNECTION) private db:Db ) {
         this.collection = this.db.collection( CollectionNames.CONTACTS_OF_COLLECTION);
    }



    async search(pno:string): Promise<GenericServiceResponseItem< SearchResponseItem>> {
        
        let hashedPhone = await hash('sha256').update(pno).digest('base64');
        //R2PIZXbno2+o88Z8qfkT5SfNF77A5JOOzJipLFQ5jXo= -> 123
        console.log(`hashed phone individual search : ${hashedPhone}`);
        let res = [];
        // try{
            try{

                //TODO SANITISE INPUT REMOEV + IN PHONE NUMBER OR REGULAR EXPRESSION CRASHES while searching
                //and need to sanitise input
                let result = await this.getContacts(hashedPhone);
                if(result== null){
                    return new GenericServiceResponseItem< null>(HttpStatus.NO_CONTENT,HttpMessage.NO_RESULT, null)
                }else {
                    result.isInfoFoundInDb = Constants.INFO_FOUND_ID_DB
                    return new GenericServiceResponseItem< SearchResponseItem>(HttpStatus.OK, HttpMessage.OK,result)
                }
            }catch(e){
                console.log(e);
                throw new HttpException('Server Error', HttpStatus.INTERNAL_SERVER_ERROR); 
            }
    
    }

    /**
     *
     * @param pno rehashed number using secret key
     * returns null/undefined if pno not found in database
     * else returns SearchREsponseItem
     */
   async getContacts(pno) : Promise<SearchResponseItem|null>{
        return new Promise(async (resolve, reject)=>{
            // this.collection.find({phoneNumber:new RegExp(pno)})
          try{
              const res =  await  this.collection.findOne({_id:pno})
              let responseitem
              if(res!=null){
                  responseitem = new SearchResponseItem()
                  responseitem.firstName = res.firstName ?? ""
                  responseitem.lastName = res.lastName ?? ""
                  responseitem.carrier = res.carrier?? ""
                  responseitem.location = res.location?? ""
                  responseitem.lineType = res.lineType?? ""
                  responseitem.country = res.country?? ""
                  responseitem.spamCount = res.spamCount?? 0
                  responseitem.thumbnailImg = res.image??""
              }
              resolve(responseitem)
          }catch(e){
              console.error(`Error while searching for number searchservice ${e}`)
              reject(e)
          }

        //
        // .limit(1)
        //     .toArray((err, data)=>{
        //          if(err){
        //              console.log(err)
        //              reject(err);
        //             //  throw new HttpException('Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
        //          }else{
        //             console.log("searchService -------------> size " + data.length)
        //              resolve(data);
        //
        //          }
        //      });
        })
    }

    async manualSearch(searchDto: ManualSearchDto) {


        await this.getPreparedNumber(searchDto)

        return undefined;
    }
    async getPreparedNumber(searchDto: ManualSearchDto) {

    }
}

// 1QZNour+mmFYF/F3rohGc7gs3vQYAsmL2us9MURT40M=
// 1QZNour+mmFYF/F3rohGc7gs3vQYAsmL2us9MURT40M=