import { Injectable, Inject, HttpException, HttpStatus } from "@nestjs/common";
import { Model } from 'mongoose'
import { Db } from "mongodb";
import { type } from "os";
import { CollectionNames } from "src/db/collection.names";
import * as bcryptjs from 'bcryptjs';

const hash = require('crypto').createHash;
@Injectable()
export class SearchService {
     private collection;
    // constructor(@InjectModel("User") private readonly userModel: Model<User>) { }
    constructor(@Inject('DATABASE_CONNECTION') private db:Db ) {
         this.collection = this.db.collection( CollectionNames.CONTACTS_COLLECTION);
    }

    async search(pno:string) {
        pno = pno.replace('+', "")
        let hashedPhone = await hash('sha256').update(pno).digest('base64');
        console.log('hashed phone number', hashedPhone);

        let res = [];
       
        // try{
            try{
                //TODO SANITISE INPUT REMOEV + IN PHONE NUMBER OR REGULAR EXPRESSION CRASHES while searching
                //and need to sanitise input
                let r = await this.getContacts(hashedPhone);
                return r
            }catch(e){
                console.log(e);
                throw new HttpException('Server Error', HttpStatus.INTERNAL_SERVER_ERROR); 
            }
      
      
          
    
    }
    getContacts(pno){
        return new Promise((resolve, reject)=>{
            // this.collection.find({phoneNumber:new RegExp(pno)})
            this.collection.find({phoneNumber:pno})
        .limit(4)
            .toArray((err, data)=>{
                 if(err){
                     console.log(err)
                     reject(err);
                    //  throw new HttpException('Server Error', HttpStatus.INTERNAL_SERVER_ERROR);   
                 }else{
                    console.log("searchService -------------> size " + data.length)
                     resolve(data);
                  
                 }
             });
        })
    }
}