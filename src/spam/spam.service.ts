import { HttpException, HttpStatus, Inject, Injectable, Logger } from "@nestjs/common";
import { Collection, Db } from "mongodb";
import { FirebaseMiddleware } from 'src/auth/firebase.middleware';
import { ContactDocument } from "src/contact/contactDocument";
import { CollectionNames } from "src/db/collection.names";
import { DatabaseModule } from "src/db/Database.Module";
import { SpamDTO, UserSpamReportRecord } from "./spam.dto";
const hash = require('crypto').createHash;

@Injectable()
export class SpamService {
    private collection: Collection
    // constructor(@InjectModel("User") private readonly userModel: Model<User>) { }
    constructor(@Inject(DatabaseModule.DATABASE_CONNECTION) private db: Db) {
        this.collection = this.db.collection(CollectionNames.CONTACTS_COLLECTION);
    }
   
    /**
     * 
     * @param pno :String phone num
     */
    async reportSpam(spamData: SpamDTO, req) {
        // const pno = spamData.phoneNumber
        // const uid = req.ß
        let res = [];

        // try{
        try {
            for(let pno in spamData.phoneNumbers){
                //TODO SANITISE INPUT REMOEV + IN PHONE NUMBER OR REGULAR EXPRESSION CRASHES while searching
            //and need to sanitise input
            const phoneNum = await (await this.preparePhonenNum(pno)).trim();
            //check if already the user reported this perticular phone number for spam
            pno = phoneNum
            const isAvailable = await this.isNumberExistInDb(pno)
            if (isAvailable) {
                const isAlreadyReported = await this.isUserAlreadyReported(spamData, pno)
                if (!isAlreadyReported) {
                    //the user have not reported this phone number as spam
                    let r = await this.incrementSpamCountOfNumber(pno).catch(e => {
                        console.log(`error while updating spam record ${e}`)
                    });
                    if (r) {
                        await this.associateTheReportedUserWithTheNumber(spamData, pno, req)
                    }
                    console.log("updated spam recoed" + r);
                }
            } else {
                //insert new Record/because the spammer number is not present in db
                let doc = new ContactDocument();
                doc.spamCount = 1;
                doc._id = pno;
                let result = await this.db.collection(CollectionNames.CONTACTS_OF_COLLECTION).insertOne(doc)
                if (result) {
                    this.associateTheReportedUserWithTheNumber(spamData, phoneNum, req)
                }
            }
            }


            return "You have already reported this number"
        } catch (e) {
            console.log(e);
            throw new HttpException('Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
        }




    }

    async isNumberExistInDb(phoneNumber: string): Promise<Boolean> {
        const res = await this.db.collection(CollectionNames.CONTACTS_OF_COLLECTION).findOne({ _id: phoneNumber })
        console.log(res);
        if (res)
            return true;

        return false
    }

    async isUserAlreadyReported(spamData: SpamDTO, num: string): Promise<Boolean> {
        const query = { uid: spamData.tokenData.uid, phoneNum: num }
        const result = await this.db.collection("userSpamReportRecord")
            .findOne({ $and: [{ uid: spamData.tokenData.uid }, { phoneNumber: num }] })

        if (result == null) {
            return false
        }
        return true
    }
    async preparePhonenNum(pno: string): Promise<string> {
        pno = await hash('sha256').update(pno).digest('base64')
        return pno;
    }
    
    incrementSpamCountOfNumber(pno: string, count: number = 1) {
        return new Promise((resolve, reject) => {
            try{
                const updateResult = this.db.collection(CollectionNames.CONTACTS_OF_COLLECTION)
                .updateOne({ _id: pno },{ $inc: { 'spamCount': count } })
                console.log("update write result ", updateResult);
                resolve(updateResult)
            }catch(e){
                console.log('Exception incrementSpamCounterFortheNumber',e )
                reject(e)
            }  
        })
    }

    decrementSpamCountOfNumber(pno: string, count: number = -1) {
        return new Promise((resolve, reject) => {
            try{
                
                const updateResult = this.db.collection(CollectionNames.CONTACTS_OF_COLLECTION)
                .updateOne({ _id: pno },{ $inc: { 'spamCount': count } } )
                console.log("update write result ", updateResult);
                resolve(updateResult)
            }catch(e){
                console.log('Exception incrementSpamCounterFortheNumber',e )
                reject(e)
            }  
        })
    }


    private async ublockTheReportedUser(spamData: SpamDTO, pno:string) {
        // spamData.
        return new Promise(async (resolve, reject) => {
            // let _userInfFrom_token = await FirebaseMiddleware.getUserId(req).catch(err => {
            //     console.log('fetching userid from token failed', err)
            // });
            // let hUid = await _userInfFrom_token['hUserId'] || ""
            try{
                let hUid = spamData.tokenData.huid;
        
                const delResult = await this.db.collection('userSpamReportRecord').deleteOne({hUid: hUid, phoneNumber: pno })
                console.log("delete res ", delResult);
                resolve(true)
            }catch(e){
                resolve(false)
                console.log("Exception ublockTheReportedUser: ", e);
            }
            
            
              
        })
    }

    private async associateTheReportedUserWithTheNumber(spamData: SpamDTO, phoneNum: any, req: any) {
        let doc: UserSpamReportRecord = Object(null)
        doc.uid = spamData.tokenData.uid;
        doc.phoneNumber = phoneNum
        let _userInfFrom_token = await FirebaseMiddleware.getUserId(req).catch(err => {
            console.log('fetching userid from token failed', err)
        });
        doc.hUid = await _userInfFrom_token['hUserId'] || ""
        const iResponse = await this.db.
            collection('userSpamReportRecord').insertOne(doc)
            .catch(e => {
                console.log(`error while inserting new  spam report ${e} `)
            })
        if (iResponse) {
            console.log("suscesfully inserted new spam record")
            //insert / upsirt
            return "Successfully reported the number as spam"
        }
    }


    async incrementTotalSpamCount() {
        await this.db.collection("totalspamblocks").updateOne({},
            { $inc: { "spamCount": 1 } })
    }


    async unblockService(_spamDTO: SpamDTO) {
        try {
            for(let pno in _spamDTO.phoneNumbers){
                const phoneAfterPrepared = await (await this.preparePhonenNum(pno)).trim();
                console.log({ phoneAfterPrepared });
                // _spamDTO.phoneNumber = phoneAfterPrepared;

                const isAlreadyReported = await this.isUserAlreadyReported(_spamDTO, phoneAfterPrepared)
                if (isAlreadyReported) {
                    await this.decrementSpamCountOfNumber(phoneAfterPrepared)
                    let response = await this.ublockTheReportedUser(_spamDTO, phoneAfterPrepared)
                    console.log(response);
                    return response;
                } else {
                    throw {
                        isAlreadyReported,
                        message: "phonenumber not exist in DB or not blocked yet"
                    }
                }
            }
            
        } catch (e) {
            console.log(e);
            throw new HttpException('Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}

