import { Injectable, Inject, HttpException, HttpStatus } from "@nestjs/common";
import { Model } from 'mongoose'
import { Collection, Db } from "mongodb";
import { type } from "os";
import { CollectionNames } from "src/db/collection.names";
import { ContactDto } from "src/contact/contact.dto";
import { SpamDTO } from "./spam.dto";
const hash = require('crypto').createHash;

@Injectable()
export class SpamService {
     private collection:Collection
    // constructor(@InjectModel("User") private readonly userModel: Model<User>) { }
    constructor(@Inject('DATABASE_CONNECTION') private db:Db ) {
         this.collection = this.db.collection( CollectionNames.CONTACTS_COLLECTION);
    }

    /**
     * 
     * @param pno :String phone num
     */
    async   reportSpam(spamData:SpamDTO) {
        const pno = spamData.phoneNumber
        // const uid = req.ß
        let res = [];
       
        // try{
            try{
                //TODO SANITISE INPUT REMOEV + IN PHONE NUMBER OR REGULAR EXPRESSION CRASHES while searching
                //and need to sanitise input
                const phoneNum = await this.preparePhonenNum(pno)
                //check if already the user reported this perticular phone number for spam
                spamData.phoneNumber = phoneNum
                const isAlreadyReported = await this.isUserAlreadyReported(spamData)
                if(!isAlreadyReported){
                    //the user have not reported this phone number as spam
                    let r = await this.incrementSpamCounterFortheNumber(pno).catch(e=>{
                        console.log(`error while updating spam record ${e}`)
                    });
                    if(r){
                        let doc :SpamDTO = Object(null)
                        doc.uid = spamData.uid
                        doc.phoneNumber = phoneNum

                       const iResponse =  await this.db.
                                    collection('userSpamReportRecord').insertOne(doc)
                                    .catch(e=>{
                                        console.log(`error while inserting new  spam report ${e} `)
                                    })
                        if(iResponse){
                            console.log("suscesfully inserted new spam record")
                            //insert / upsirt
                            return "Successfully reported the number as spam"
                        }
                    }
                    console.log("updated spam recoed" + r);
                  
                }
                
                return "You have already reported this number"
            }catch(e){
                console.log(e);
                throw new HttpException('Server Error', HttpStatus.INTERNAL_SERVER_ERROR); 
            }
      
      
          
    
    }

    async isUserAlreadyReported(spamData:SpamDTO) : Promise<Boolean>{
        const query = {uid:spamData.uid, phoneNum:spamData.phoneNumber}
       const result = await  this.db.collection("userSpamReportRecord")
                    .findOne({$and:[{uid:spamData.uid}, {phoneNumber:spamData.phoneNumber}]})
                           
            if(result == null){
                return false
            }
            return true
    }
    async preparePhonenNum(pno:string):Promise<string>{
        pno = pno.trim().replace("+","")
        pno = await hash('sha256').update(pno).digest('base64')
        return pno;
    }
     incrementSpamCounterFortheNumber(pno){
        return new Promise((resolve, reject)=>{
            // ContactDto    
             this.db.collection('contactsNew').updateOne({phoneNumber:pno},
                {$inc:{'spammerStatus.spamCount':1}}, {upsert:true}
                ).then(data=>{
                    resolve(data)
                }).catch(e=>{
                    reject(e)
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

