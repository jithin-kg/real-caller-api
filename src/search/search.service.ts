import { Injectable, Inject, HttpException, HttpStatus } from "@nestjs/common";
import { Model } from 'mongoose'
import { Db } from "mongodb";
import { type } from "os";
import { CollectionNames } from "src/db/collection.names";
@Injectable()
export class SearchService {
    // constructor(@InjectModel("User") private readonly userModel: Model<User>) { }
    constructor(@Inject('DATABASE_CONNECTION') private db:Db ) { }

    async search(pno:string) {
        let collection = this.db.collection( CollectionNames.CONTACTS_COLLECTION);
        let res = [];
       
        // try{
        let n = 918
        collection.find({phoneNumber:new RegExp(pno)})
        .limit(4)
            .toArray((err, data)=>{
                 if(err){
                     console.log(err)
                     throw new HttpException('Server Error', HttpStatus.INTERNAL_SERVER_ERROR);   
                 }else{
                     return data;
                  
                 }
             });
          
    
    }
}