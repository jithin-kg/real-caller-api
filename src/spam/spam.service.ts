import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { Collection, Db } from "mongodb";
import { FirebaseMiddleware } from 'src/auth/firebase.middleware';
import { ContactDocument } from "src/contact/contactDocument";
import { CollectionNames } from "src/db/collection.names";
import { DatabaseModule } from "src/db/Database.Module";
import { SpamDTO } from "./spam.dto";
const hash = require('crypto').createHash;

@Injectable()
export class SpamService {
    private collection: Collection
    // constructor(@InjectModel("User") private readonly userModel: Model<User>) { }
    constructor(@Inject(DatabaseModule.DATABASE_CONNECTION) private db: Db) {
        this.collection = this.db.collection(CollectionNames.CONTACTS_COLLECTION);
    }
    async reportTest(spamData: SpamDTO) {
        let pno = spamData.phoneNumber
        try {
            const phoneNum = await (await this.preparePhonenNum(pno)).trim()
            console.log(`prepared phoneNum is ${phoneNum}`)
            const result = await this.db.collection(CollectionNames.CONTACTS_OF_COLLECTION).updateOne({ _id: phoneNum },
                { $inc: { 'spammCount': 1 } });
            console.log(result)
        } catch (e) {
            console.log(e);
        }
    }
    /**
     * 
     * @param pno :String phone num
     */
    async reportSpam(spamData: SpamDTO, req) {
        const pno = spamData.phoneNumber
        // const uid = req.ß
        let res = [];

        // try{
        try {
            //TODO SANITISE INPUT REMOEV + IN PHONE NUMBER OR REGULAR EXPRESSION CRASHES while searching
            //and need to sanitise input
            const phoneNum = await (await this.preparePhonenNum(pno)).trim();
            //check if already the user reported this perticular phone number for spam
            spamData.phoneNumber = phoneNum
            const isAvailable = await this.isNumberExistInDb(spamData.phoneNumber)
            if (isAvailable) {
                const isAlreadyReported = await this.isUserAlreadyReported(spamData, phoneNum)
                if (!isAlreadyReported) {
                    //the user have not reported this phone number as spam
                    let r = await this.incrementSpamCounterFortheNumber(phoneNum).catch(e => {
                        console.log(`error while updating spam record ${e}`)
                    });
                    if (r) {
                        await this.associateTheReportedUserWithTheNumber(spamData, phoneNum, req)
                    }
                    console.log("updated spam recoed" + r);

                }
            } else {
                //insert new Record/because the spammer number is not present in db
                let doc = new ContactDocument();
                doc.spamCount = 1;
                doc._id = spamData.phoneNumber;
                spamData.phoneNumber
                let result = await this.db.collection(CollectionNames.CONTACTS_OF_COLLECTION).insertOne(doc)
                if (result) {
                    this.associateTheReportedUserWithTheNumber(spamData, phoneNum, req)
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

    async isUserAlreadyReported(spamData: SpamDTO, phoneNum: string): Promise<Boolean> {
        const query = { uid: spamData.uid, phoneNum: spamData.phoneNumber }
        const result = await this.db.collection("userSpamReportRecord")
            .findOne({ $and: [{ uid: spamData.uid }, { phoneNumber: phoneNum }] })

        if (result == null) {
            return false
        }
        return true
    }
    async preparePhonenNum(pno: string): Promise<string> {
        pno = await hash('sha256').update(pno).digest('base64')
        return pno;
    }
    incrementSpamCounterFortheNumber(pno: string, count: number = 1) {
        return new Promise((resolve, reject) => {
            // ContactDto    
            console.log(pno)
            this.db.collection(CollectionNames.CONTACTS_OF_COLLECTION).updateOne({ _id: pno.trim() },
                { $inc: { 'spamCount': count } }
            ).then(data => {
                resolve(data)
            }).catch(e => {
                reject(e)
            })
            //                 //TODO when inserting insert data 


        })
    }
    private async ublockTheReportedUser(spamData: SpamDTO, req: any) {
        return new Promise(async (resolve, reject) => {
            let _userInfFrom_token = await FirebaseMiddleware.getUserId(req).catch(err => {
                console.log('fetching userid from token failed', err)
            });
            let hUid = await _userInfFrom_token['hUserId'] || ""
            await this.db.
                collection('userSpamReportRecord').deleteOne({ hUid, phoneNumber: spamData.phoneNumber }).then(res => {
                    resolve(true);
                })
                .catch(e => {
                    console.log(`error while removing spam report ${e} `)
                    reject(false);
                })
        })
    }
    private async associateTheReportedUserWithTheNumber(spamData: SpamDTO, phoneNum: any, req: any) {
        let doc: SpamDTO = Object(null)
        doc.uid = spamData.uid
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


    async unblockService(_spamDTO: SpamDTO, _request) {
        try {
            const { phoneNumber: pno } = _spamDTO;
            const phoneAfterPrepared = await (await this.preparePhonenNum(pno)).trim();
            console.log({ phoneAfterPrepared });
            _spamDTO.phoneNumber = phoneAfterPrepared;
            console.log({_spamDTO});
            const isAlreadyReported = await this.isUserAlreadyReported(_spamDTO, phoneAfterPrepared)
            if (isAlreadyReported) {
                await this.incrementSpamCounterFortheNumber(phoneAfterPrepared, -1).catch(e => {
                    console.log(`error while updating spam record ${e}`)
                });
                let response = await this.ublockTheReportedUser(_spamDTO, _request)
                console.log(response);
                return response;
            } else {
                throw {
                    isAlreadyReported,
                    message: "phonenumber not exist in DB or not blocked yet"
                }
            }
        } catch (e) {
            console.log(e);
            throw new HttpException('Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}

