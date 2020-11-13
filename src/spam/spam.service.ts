import { Injectable, Inject, HttpException, HttpStatus } from "@nestjs/common";
import { Model } from 'mongoose'
import { Collection, Db } from "mongodb";
import { type } from "os";
import { CollectionNames } from "src/db/collection.names";
import { ContactDto } from "src/contact/contact.dto";
@Injectable()
export class SpamService {
     private collection:Collection
    // constructor(@InjectModel("User") private readonly userModel: Model<User>) { }
    constructor(@Inject('DATABASE_CONNECTION') private db:Db ) {
         this.collection = this.db.collection( CollectionNames.CONTACTS_COLLECTION);
    }

    async   reportSpam(pno:string) {
        
        let res = [];
       
        // try{
            try{
                //TODO SANITISE INPUT REMOEV + IN PHONE NUMBER OR REGULAR EXPRESSION CRASHES while searching
                //and need to sanitise input
                let r = await this.update(pno);
                console.log("updated spam recoed" + r);
                return r
            }catch(e){
                console.log(e);
                throw new HttpException('Server Error', HttpStatus.INTERNAL_SERVER_ERROR); 
            }
      
      
          
    
    }
     update(pno){
        return new Promise((resolve, reject)=>{
            // ContactDto    
             this.collection.updateOne({phoneNumber:pno},
                {$inc:{'spammerStatus.spamCount':1}}, 
                (err,data)=>{
                    if(err){
                        reject(err);
                    }else{
                        resolve(data);
                    }
                })
//                 //TODO when inserting insert data 
//                 // When you added the score to a player with :

// // PlayersList.insert({name: 'test', score:3});

// // I suppose, you could increase the score. But not anymore.

// // It's because you passed a text parameter instead of an integer. When you add a player you should use parseInt():

// //  PlayersList.insert({
// //   name: name,
// //   score: parseInt(score),
// //   createdBy: Meteor.userId()
// // })
// // https://stackoverflow.com/questions/28837301/meteor-methods-and-mongo-inc-non-number-error/29078249
// o


//                 {$inc:{'spammerStatus.spamCount': {qty:1}}}, 
//                 (err,data)=>{
//                     if(err){
//                         reject(err);
//                     }else{
//                         resolve(data);
//                     }
//                 })
            
        })
    }
}


