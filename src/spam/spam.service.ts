import { HttpException, HttpStatus, Inject, Injectable, Logger } from "@nestjs/common";
import { Collection, Db } from "mongodb";
import { FirebaseMiddleware } from 'src/auth/firebase.middleware';
import { ContactDocument } from "src/contactManage/dto/contactDocument";
import { CollectionNames } from "src/db/collection.names";
import { DatabaseModule } from "src/db/Database.Module";
import { GenericServiceResponseItem } from "src/utils/Generic.ServiceResponseItem";
import { NumberTransformService } from "src/utils/numbertransform.service";
import { SpamDTO, UserSpamReportRecord } from "./dto/spam.dto";
import { SpammerTypeVAlues } from "./dto/spam.type";
import { SpamThresholdDoc } from "./dto/spamthreshold.doc";
import { SpamThresholdUpdateResultDto } from "./dto/thresholdupdateresult.dto";
import { UserSpamReportRecordHelper } from "./userspamreportrecord.helper";
const hash = require('crypto').createHash;

@Injectable()
export class SpamService {
    private collection: Collection
    // constructor(@InjectModel("User") private readonly userModel: Model<User>) { }
    constructor(
        @Inject(DatabaseModule.DATABASE_CONNECTION) private db: Db,
        private readonly numberTransformService: NumberTransformService
        ) {
        this.collection = this.db.collection(CollectionNames.CONTACTS_COLLECTION);
    }
   
    /**
     * 
     * @param pno :String phone num
     */
    async reportSpam(spamData: SpamDTO): Promise<GenericServiceResponseItem<string>> {


        let res = [];

        // try{
        try {
            for(let pno of spamData.phoneNumbers){
                //TODO SANITISE INPUT REMOEV + IN PHONE NUMBER OR REGULAR EXPRESSION CRASHES while searching
            //and need to sanitise input
            const phoneNum = await this.numberTransformService.tranforNum(pno);
            //check if already the user reported this perticular phone number for spam
            pno = phoneNum
            const isAvailable = await this.isNumberExistInDb(pno)
            if (isAvailable) {
                const isAlreadyReported = await this.isUserAlreadyReported(spamData, pno)
                if (isAlreadyReported == null) {
                    //the user have not reported this phone number as spam
                    let r = await this.incrementSpamCountOfNumber(pno, spamData.spammerType)
                    if (r) {
                        await this.associateTheReportedUserWithTheNumber(spamData, pno)
                    }
                }
            } else {
                //insert new Record/because the spammer number is not present in db
                let doc = new ContactDocument();
                doc.spamCount = 1;
                doc._id = pno;
                let result = await this.db.collection(CollectionNames.CONTACTS_OF_COLLECTION).insertOne(doc)
                if (result) {
                    this.associateTheReportedUserWithTheNumber(spamData, phoneNum)
                }
            }
            }
            return GenericServiceResponseItem.returnGoodResponse("")
        } catch (e) {
            console.log(e);
            return GenericServiceResponseItem.returnServerErrRes()
        }




    }

    async isNumberExistInDb(phoneNumber: string): Promise<Boolean> {
        const res = await this.db.collection(CollectionNames.CONTACTS_OF_COLLECTION).findOne({ _id: phoneNumber })
        console.log(res);
        if (res)
            return true;

        return false
    }

    async isUserAlreadyReported(spamData: SpamDTO, num: string): Promise<UserSpamReportRecord> {
        const query = { uid: spamData.tokenData.uid, phoneNum: num }
        const result = await this.db.collection("userSpamReportRecord")
            .findOne({ $and: [{ uid: spamData.tokenData.uid }, { phoneNumber: num }] })
        
        if (result == null) {
            return null
        }
       
        return  UserSpamReportRecordHelper.dbResToSpamRecordClass(result);
    }

    incrementSpamCountOfNumber(pno: string,spamerType:string,  count: number = 1 ) {
        return new Promise((resolve, reject) => {
            try{
                let incOperation = this.getPerparedOperator(spamerType, count);
                console.log("spam phone number is ", pno)
                const updateResult = this.db.collection(CollectionNames.CONTACTS_OF_COLLECTION)
                .updateOne({ _id: pno },{ $inc: incOperation})
                console.log("update write result ", updateResult);
                resolve(updateResult)
            }catch(e){
                console.log('Exception incrementSpamCounterFortheNumber',e )
                reject(e)
            }  
        })
    }

  

    decrementSpamCountOfNumber(pno: string,spamDTO:SpamDTO,userSpamReportRecord:UserSpamReportRecord, count: number = -1) {
        return new Promise((resolve, reject) => {
            try{
                let decOperation = this.getPerparedOperator(userSpamReportRecord.spammerType, count);
                const updateResult = this.db.collection(CollectionNames.CONTACTS_OF_COLLECTION)
                .updateOne({ _id: pno },{ $inc: decOperation } )
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

    private async associateTheReportedUserWithTheNumber(spamData: SpamDTO, phoneNum: any) {
        let doc: UserSpamReportRecord = Object(null)
        doc.uid = spamData.tokenData.uid;
        doc.phoneNumber = phoneNum
        // let _userInfFrom_token = await FirebaseMiddleware.getUserId(req).catch(err => {
        //     console.log('fetching userid from token failed', err)
        // });
        // doc.hUid = await _userInfFrom_token['hUserId'] || ""
        doc.hUid = spamData.tokenData.huid;
        doc.spammerType = spamData.spammerType;
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


    async unblockService(_spamDTO: SpamDTO): Promise<GenericServiceResponseItem<string>> {
        try {
            for(let pno of _spamDTO.phoneNumbers){
                const phoneAfterPrepared = await (await this.numberTransformService.tranforNum (pno)).trim();
                console.log({ phoneAfterPrepared });
                // _spamDTO.phoneNumber = phoneAfterPrepared;

                const userSpamReportRecord = await this.isUserAlreadyReported(_spamDTO, phoneAfterPrepared)
                if (userSpamReportRecord !=null) {
                    await this.decrementSpamCountOfNumber(phoneAfterPrepared, _spamDTO, userSpamReportRecord)
                   await this.ublockTheReportedUser(_spamDTO, phoneAfterPrepared)
                    return GenericServiceResponseItem.returnGoodResponse("");
                } else {
                    throw {
                        message: "phonenumber not exist in DB or not blocked yet"
                    }
                }
            }
            return GenericServiceResponseItem.returnGoodResponse("")
        } catch (e) {
            console.log(e);
            return GenericServiceResponseItem.returnServerErrRes()
        }
    }
    /**
     * function to return mongodb $inc operator
     * @param spamerType 
     * @param count either 1 or -1 , if(1) increment else if(-1) decrement
     */
    getPerparedOperator(spamerType:string, count:number): any {
        let incOperation;
        if(spamerType == SpammerTypeVAlues.SPAMMER_TYPE_BUSINESS){
            incOperation = {
              'spamCount': count,
              'spamerType.business': count
           }
       }else if(spamerType == SpammerTypeVAlues.SPAMMER_TYPE_PEERSON){
            incOperation = {
               'spamCount': count,
               'spamerType.person': count
            }
       }  else if(spamerType == SpammerTypeVAlues.SPAMMER_TYPE_PEERSON){
            incOperation = {
               'spamCount': count,
               'spamerType.person': count
            }
       }else if(spamerType == SpammerTypeVAlues.SPAMMER_TYPE_SALES){
            incOperation = {
               'spamCount': count,
               'spamerType.sales': count
            }
       }else if(spamerType == SpammerTypeVAlues.SPAMMER_TYPE_SCAM){
            incOperation = {
               'spamCount': count,
               'spamerType.scam': count
            }
       }else {
            incOperation = {
               'spamCount': count,
               'spamerType.notSpecific': count
            }
       }
       return incOperation
    }

    async getSpamThreshold(): Promise<GenericServiceResponseItem<SpamThresholdUpdateResultDto>>{
        try{
            let res = new SpamThresholdUpdateResultDto()
            res.threshold = 10
            const resultDoc = await this.db.collection(CollectionNames.SPAM_THRESHOLD).findOne({}) as SpamThresholdDoc
            if(resultDoc != null ){
                if(resultDoc.threshold <= 0  || resultDoc.threshold >= 100){
                    res.threshold = resultDoc.threshold;
                }
                console.log("Spam threshold is greater or less than limit")
            }
            return GenericServiceResponseItem.returnGoodResponse(res);
        }catch(e){
            console.log('exception getSpamThreshold()',e)
            return GenericServiceResponseItem.returnServerErrRes()
        }
    }
}

