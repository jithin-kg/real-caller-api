import { Injectable, Inject, HttpException, HttpStatus } from "@nestjs/common";
import { Model } from 'mongoose'
import { Db } from "mongodb";
import { type } from "os";
import { CollectionNames } from "src/db/collection.names";
import * as bcryptjs from 'bcryptjs';
import {SearchResponseItem} from "./SearchResponseItem";
import {GenericServiceResponseItem} from "../utils/Generic.ServiceResponseItem";

const hash = require('crypto').createHash;
@Injectable()
export class SearchService {
     private collection;
    // constructor(@InjectModel("User") private readonly userModel: Model<User>) { }
    constructor(@Inject('DATABASE_CONNECTION') private db:Db ) {
         this.collection = this.db.collection( CollectionNames.CONTACTS_OF_COLLECTION);
    }

    async search(pno:string): Promise<GenericServiceResponseItem<number, SearchResponseItem>> {
        // pno = pno.replace('+', "")
        let hashedPhone = await hash('sha256').update(pno).digest('base64');
        //thNKskB5fqfu3a7S8Zm7hos4b9dpHXzr7tyecK/dfKk= ->100101 contact bulkbefore inserting into db
        console.log(`hashed phone number ${hashedPhone}`);

        let res = [];

        // try{
            try{
                //TODO SANITISE INPUT REMOEV + IN PHONE NUMBER OR REGULAR EXPRESSION CRASHES while searching
                //and need to sanitise input
                let r = await this.getContacts(hashedPhone);
                if(r== null){
                    return new GenericServiceResponseItem<number, null>(HttpStatus.NO_CONTENT, null)
                }else{
                    return new GenericServiceResponseItem<number, SearchResponseItem>(HttpStatus.OK,r)
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
                  responseitem.spamCount = res.spamCount?? ""
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
}

// 1QZNour+mmFYF/F3rohGc7gs3vQYAsmL2us9MURT40M=
// 1QZNour+mmFYF/F3rohGc7gs3vQYAsmL2us9MURT40M=