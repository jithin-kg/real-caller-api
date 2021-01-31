import { Injectable, Inject, HttpException, HttpStatus } from "@nestjs/common";
import { Model } from 'mongoose'
import { Collection, Db } from "mongodb";
import { type } from "os";
import { CollectionNames } from "src/db/collection.names";
import { ContactDto } from "src/contact/contact.dto";
import { SpamDTO } from "./spam.dto";
import { ContactDocument } from "src/contact/contactDocument";
const hash = require('crypto').createHash;

@Injectable()
export class SpamService {
     private collection:Collection
    // constructor(@InjectModel("User") private readonly userModel: Model<User>) { }
    constructor(@Inject('DATABASE_CONNECTION') private db:Db ) {
         this.collection = this.db.collection( CollectionNames.CONTACTS_COLLECTION);
    }
    async reportTest(spamData:SpamDTO){
        let pno = spamData.phoneNumber
        try{
            const phoneNum = await (await this.preparePhonenNum(pno)).trim()
            console.log(`prepared phoneNum is ${phoneNum}`)                                                  
             const result = await this.db.collection(CollectionNames.CONTACTS_OF_COLLECTION).updateOne({_id:phoneNum},
                {$inc:{'spammCount':1}});
            console.log(result)
        }catch(e){
            console.log(e);
        }
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
                const phoneNum = await (await this.preparePhonenNum(pno)).trim();
                //check if already the user reported this perticular phone number for spam
                spamData.phoneNumber = phoneNum
                const isAvailable = await this.isNumberExistInDb(spamData.phoneNumber)
                if(isAvailable){
                    const isAlreadyReported = await this.isUserAlreadyReported(spamData, phoneNum)
                    if(!isAlreadyReported){
                        //the user have not reported this phone number as spam
                        let r = await this.incrementSpamCounterFortheNumber(phoneNum).catch(e=>{
                            console.log(`error while updating spam record ${e}`)
                        });
                        if(r){
                          await this.associateTheReportedUserWithTheNumber(spamData, phoneNum)
                        }
                        console.log("updated spam recoed" + r);
                      
                    }
                }else{
                    //insert new Record/because the spammer number is not present in db
                    let doc = new ContactDocument();
                    doc.spamCount = 1;
                    doc._id = spamData.phoneNumber;
                    spamData.phoneNumber
                   let result = await this.db.collection(CollectionNames.CONTACTS_OF_COLLECTION).insertOne(doc)
                    if(result){
                        this.associateTheReportedUserWithTheNumber(spamData, phoneNum)
                    }
                }
                
                
                return "You have already reported this number"
            }catch(e){
                console.log(e);
                throw new HttpException('Server Error', HttpStatus.INTERNAL_SERVER_ERROR); 
            }
      
      
          
    
    }

    async isNumberExistInDb(phoneNumber:string) : Promise<Boolean>{
       const res =  await this.db.collection(CollectionNames.CONTACTS_OF_COLLECTION).findOne({_id:phoneNumber})
       console.log(res);
       if(res)
       return true;

       return false
    }

    async isUserAlreadyReported(spamData:SpamDTO, phoneNum:string) : Promise<Boolean>{
        const query = {uid:spamData.uid, phoneNum:spamData.phoneNumber}
       const result = await  this.db.collection("userSpamReportRecord")
                    .findOne({$and:[{uid:spamData.uid}, {phoneNumber:phoneNum}]})
                           
            if(result == null){
                return false
            }
            return true
    }
    async preparePhonenNum(pno:string):Promise<string>{
        pno = await hash('sha256').update(pno).digest('base64')
        return pno;
    }
     incrementSpamCounterFortheNumber(pno:string){
        return new Promise((resolve, reject)=>{
            // ContactDto    
            console.log(pno)
             this.db.collection(CollectionNames.CONTACTS_OF_COLLECTION).updateOne({_id:pno.trim()},
                {$inc:{'spamCount':1}}
                ).then(data=>{
                    resolve(data)
                }).catch(e=>{
                    reject(e)
                })
//                 //TODO when inserting insert data 

            
        })
    }
    private async associateTheReportedUserWithTheNumber(spamData: SpamDTO, phoneNum: any) {
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


}

