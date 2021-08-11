import { processHelper } from './../utils/processHelper';
import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { validateOrReject } from "class-validator";
import * as fs from 'fs';
import * as jwt from "jsonwebtoken";
import { Db } from "mongodb";
import * as nodemailer from "nodemailer";
import * as PDFDocument from "pdfkit";
import { DatabaseModule } from "src/db/Database.Module";
import { FirebaseMiddleware } from "../auth/firebase.middleware";
import { Indiaprefixlocationmaps } from "../carrierService/carrier.info.schema";
import { CarrierService } from "../carrierService/carrier.service";
import { ContactProcessingItem } from "../contact/contactProcessingItem";
import { CollectionNames } from "../db/collection.names";
import { ContactObjectTransformHelper } from "../utils/ContactObjectTransformHelper";
import { NumberTransformService } from "../utils/numbertransform.service";
import { UserIdDTO } from "../utils/UserId.DTO";
import { EmailAndUID } from "./EmailAndUID";
import { Formatter } from './Formatter';
import { SignupBodyDto } from "./singupBody";
import { User } from "./user.schema";
import { UserInfoRequest } from './userinfoRequest.dto';
import { UserInfoResponseDTO } from "./userResponse.dto";
import { GenericServiceResponseItem } from 'src/utils/Generic.ServiceResponseItem';
import { HttpMessage } from 'src/utils/Http-message.enum';
import { HAccessTokenData } from 'src/auth/accessToken.dto';
import { DeactivateDTO } from './deactivate.dto';


@Injectable()
export class Userservice {
    


    // constructor(@InjectModel("User") private readonly userModel: Model<User>) { }
    constructor(@Inject(DatabaseModule.DATABASE_CONNECTION) private db: Db,
        private numberTransformService: NumberTransformService
    ) { }

    /**
     * function to check if a user with the rehashed number exists in server
     * if exists then update the firebase uid of that user
     * @param id userid from firebase
     * @param hashedNum
     */
    getUserInfoByid(id: string, hashedNum: string): Promise<UserInfoResponseDTO | null> {
        return new Promise(async resolve => {
            Promise.resolve().then(async res => {
                try {
                    const rehashedNum = await this.numberTransformService.tranforNum(hashedNum)
                    console.log('parallelProcess userInfo,customToken>>>start')
    
                    const _parallelProcessFunctions = [
                        this.db.collection(CollectionNames.USERS_COLLECTION).findOne({ _id: rehashedNum }),
                        FirebaseMiddleware.createCustomToken(id, rehashedNum)
                    ];
    
                    const parallelRes = await processHelper.doParallelProcess(_parallelProcessFunctions);
    
                    console.log('parallelProcess userInfo,customToken>>>end')
                    let result = Object.create(null); //to store userInfo
                    if (parallelRes && parallelRes[0]) result = parallelRes[0].value;
                    let CUSTOM_TOKEN: string = "";
                    if (parallelRes && parallelRes[1]) CUSTOM_TOKEN = parallelRes[1].value;
                    const user = new UserInfoResponseDTO()
    
                    if (result) { //result != null || result != undefined
                        // user.email = result.email
                        user.firstName = result.firstName
                        user.lastName = result.lastName
                        user.image = result.image
                        //todo remove this in production, this is for project only
    
                        if (result.isBlockedByAdmin) {
                            user.isBlockedByAdmin = 1
                            await FirebaseMiddleware.desableUser(id)
                        } else {
                            //only create custom token if user is not blocked by admin
                            // const customToken: string = await FirebaseMiddleware.createCustomToken(id, rehashedNum)
                            user.customToken = CUSTOM_TOKEN;
                            user.isBlockedByAdmin = 0
                        }
    
                        let updationOp = { $set: { "uid": id } }
                        let existingUId = result.uid
                        try {
                            console.log('parallelProcess updateUser,removeUserById>>>start')
                            const _parallelProcessFunctions = [
                                this.db.collection(CollectionNames.USERS_COLLECTION).updateOne({ _id: rehashedNum }, updationOp),
                                FirebaseMiddleware.removeUserById(existingUId)
                            ]
                            await processHelper.doParallelProcess(_parallelProcessFunctions);
                            console.log('parallelProcess updateUser,removeUserById>>>end')
                        } catch (e) {
                            console.log(e)
                        }
                        // console.timeEnd("getUserInfoByid")
                        resolve(user);
                        return;
                    } else {
                        user.customToken = CUSTOM_TOKEN;
                    }
                    // console.timeEnd("getUserInfoByid")
                    resolve(user);
                    return;
                } catch (e) {
                    resolve(null)
                    return;
                }
            })
            //wihout try catch there might arise unhandled promise rejection exception
            

        })

    }
    async getUserInformationById(req, userInfo: UserInfoRequest): Promise<GenericServiceResponseItem<UserInfoResponseDTO>> {
        return new Promise(async (resolve) => {
            // console.time("getUserInfo");
            try {
                let user: UserInfoResponseDTO;
                const id = userInfo.tokenData.uid;
                const phoneNumInToken: string = await FirebaseMiddleware.getPhoneNumberFromToken(req)

                if (!phoneNumInToken) {
                    resolve(GenericServiceResponseItem.returnBadRequestResponse())
                    return; // this is important to end function execution after resolve or reject
                }

                const formatedNum = Formatter.getFormatedPhoneNumber(phoneNumInToken)
                const formatedNumInRequestBody = Formatter.getFormatedPhoneNumber(userInfo.formattedPhoneNum);
                if (formatedNum == formatedNumInRequestBody) {
                    console.log(`returning user-before parallel process`, user)
                    let processList = [
                        this.getUserInfoByid(id, userInfo.hashedNum),
                        FirebaseMiddleware.removeUserPhoneNumberFromFirebase(id)
                    ]
                    // const [resultGetUsrBYId, resultRemoveUserNumFirebase]= await Promise.allSettled(processList)
                    const [resultGetUsrBYId, resultRemoveUserNumFirebase] = await processHelper.doParallelProcess(processList);
                 
                    // if (results && results[0]) user = results[0].;
                    if(resultGetUsrBYId.status == processHelper.FULL_FILLED){
                        user = resultGetUsrBYId.value
                        if (user.isBlockedByAdmin) {
                            console.log('user  blocked by admin')
                            // reject(new HttpException("Bad request", HttpStatus.FORBIDDEN))
                            resolve(GenericServiceResponseItem.returnBadRequestResponse())
                            return
                        } else {
                            console.log('user not blocked by admin')
                        }
                    }
                    if(resultRemoveUserNumFirebase.status == processHelper.FULL_FILLED){
                        user.isPhoneNumRemovedInFireBs = true
                    }
                    // console.timeEnd("getUserInfo")
                    // console.log(`returning user`, user)
                    // if (results.length >= 2) {
                    //     if (results[1].status == processHelper.FULL_FILLED) {
                    //         user.isPhoneNumRemovedInFireBs = true
                    //     }
                    // }
                    // let response = new GenericServiceResponseItem<UserInfoResponseDTO>(HttpStatus.OK, HttpMessage.OK, user)

                    resolve(GenericServiceResponseItem.returnGoodResponse(user))
                    return;
                } else {
                    // reject(new HttpException("Bad request", 400))
                    resolve(GenericServiceResponseItem.returnBadRequestResponse())
                    return
                }
            } catch (e) {
                console.log(`Exception while getUserInformationById ${e}`)
                resolve(GenericServiceResponseItem.returnServerErrRes())
                return;
            }


        })
    }
    async updateUserInfo(userDTO: SignupBodyDto, userIdDTO: UserIdDTO, imgFile: Express.Multer.File):Promise<GenericServiceResponseItem<UserInfoResponseDTO>> {
        try {
            let fileBuffer: Buffer = null
            fileBuffer = await this.getImageBuffer(imgFile)
            let updationOp
            if (fileBuffer == null) {
                updationOp = { $set: { "firstName": userDTO.firstName, "lastName": userDTO.lastName } }
            } else {
                updationOp = { $set: { "firstName": userDTO.firstName, "lastName": userDTO.lastName, "image": fileBuffer } }
            }

            await this.db.collection(CollectionNames.USERS_COLLECTION).updateOne({ hUserId: userIdDTO.hUserId }, updationOp)

            const user = new UserInfoResponseDTO()
            user.firstName = userDTO.firstName
            user.lastName = userDTO.lastName
            let fileEncodedString = ""
            if (fileBuffer != null) {
                fileEncodedString = fileBuffer.toString("base64")
            }
            user.image = fileEncodedString
            return GenericServiceResponseItem.returnGoodResponse(user)
        } catch (e) {
            console.error(`error while updating user info ${e}`)
            const user = new UserInfoResponseDTO()
            return GenericServiceResponseItem.returnBadRequestResponse()

        }
    }

    async signup(userDto: SignupBodyDto, hAccesstokenData: HAccessTokenData, imgFile?: Express.Multer.File,): Promise<GenericServiceResponseItem<UserInfoResponseDTO|null>> {
        try {
            let fileBuffer: Buffer = null
            fileBuffer = await this.getImageBuffer(imgFile)
            const rehasehdNum = await this.numberTransformService.tranforNum(userDto.hashedNum)
            const user = await this.db.collection(CollectionNames.USERS_COLLECTION).findOne({ _id: rehasehdNum })
            if (user == null) {
                await validateOrReject(userDto) //validation
                try {
                    //first signup the user
                    // const savedUser = await this.saveToUsersCollection(userDto, uidDTO, rehasehdNum, fileBuffer)
                    //then update or insert the user info in contacts collection
                    // const promiseRes = await Promise.all([
                    //     (async ()=> { await this.saveToUsersCollection(userDto, uidDTO, rehasehdNum, fileBuffer) })(),
                    //     (async ()=> {await this.saveToContactsCollection(userDto, uidDTO, fileBuffer, rehasehdNum)})()
                        
                    // ])
                    const promiseRes = await Promise.all([
                          this.saveToUsersCollection(userDto, hAccesstokenData, rehasehdNum, fileBuffer) ,
                         this.saveToContactsCollection(userDto, hAccesstokenData, fileBuffer, rehasehdNum)
                        
                    ])
                    return GenericServiceResponseItem.returnGoodResponse(promiseRes[0], HttpStatus.CREATED)
                } catch (err) {
                    console.log("error while saving", err);
                    const user = new UserInfoResponseDTO()
                    return GenericServiceResponseItem.returnServerErrRes()
                }
            } else {
                 return GenericServiceResponseItem.returnBadRequestResponse(HttpMessage.USER_ALREADY_EXISTS);
            }

        } catch (err) {
            console.log("error on signup ", err);
            const user = new UserInfoResponseDTO()
            return GenericServiceResponseItem.returnServerErrRes()
        }


    }

    /**
     * function to save user info into CollectionNames.CONTACTS_OF_COLLECTION
     * this function save phone number user used to signup to contacts collection
     * and upsert if the phone, ie hash already exists, there by ensuring when a user
     * sings ups his name will be automatically updated to what ever name he entered in singup form
     * and when cotnact upload bulk operation there is no upsert.
     * @param userDto
     * @param uidDTO
     * @param fileBuffer
     */

    saveToContactsCollection(userDto: SignupBodyDto, hAccesstokenData: HAccessTokenData, fileBuffer: Buffer, rehasehdNum: string): Promise<void> {
        return new Promise(async (resolve, reject) => {
            try {
                const infoWithCarrierService: Indiaprefixlocationmaps = await CarrierService.getInfo(userDto.phoneNumber, this.db, parseInt(userDto.countryCode), userDto.countryISO)
                let contactWithCarrierInfo = new ContactProcessingItem();
                contactWithCarrierInfo.firstName = userDto.firstName
                contactWithCarrierInfo.lastName = userDto.lastName
                contactWithCarrierInfo.hashedPhoneNumber = rehasehdNum
                if (fileBuffer != undefined) {
                    contactWithCarrierInfo.image = fileBuffer.toString("base64")
                }

                ContactObjectTransformHelper.setCarrierInfo(contactWithCarrierInfo, infoWithCarrierService)
                const docToInsert = ContactObjectTransformHelper.prepareContactDocForInsertingIntoDb(contactWithCarrierInfo, fileBuffer)
                const res = await this.db.collection(CollectionNames.CONTACTS_OF_COLLECTION).replaceOne({ _id: docToInsert._id },
                    docToInsert, { upsert: true })
                resolve()
                return;
            } catch (e) {
                console.error(`Error while saving user info ${e}`)
                reject(e)
                return;
            }
        })

    }
    async saveToUsersCollection(userDto: SignupBodyDto, hAccesstokenData: HAccessTokenData, rehasehdNum: string, fileBuffer?: Buffer): Promise<UserInfoResponseDTO> {
        return new Promise(async (resolve, reject) => {
            try {
                let newUser = await this.prepareUser(userDto, hAccesstokenData, rehasehdNum);
                newUser.image = fileBuffer //setting image buffer to insert
                const res = await this.db.collection(CollectionNames.USERS_COLLECTION).insertOne(newUser);
                const user = new UserInfoResponseDTO()
                //  user.email = newUser.email
                user.firstName = newUser.firstName
                user.lastName = newUser.lastName
                if (fileBuffer != undefined) {
                    user.image = fileBuffer.toString("base64")
                } else {
                    user.image = ""
                }
                resolve(user)
            } catch (e) {
                console.error(`Error while saving user  ${e}`)
                reject(e)
            }
        })
    }
    async getImageBuffer(imgFile: Express.Multer.File): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            if (imgFile != undefined) {
                fs.readFile(imgFile.path.toString(), async (err, data) => {
                    if (err) {
                        reject(err)
                    }
                    try {
                        await this.removeFile(imgFile.path.toString())
                    } catch (e) {
                        reject(e)
                    }
                    resolve(data)
                });
            } else {
                resolve(null)
            }


        })
    }
    /**
     * Function to remove file that is saved by multer
     */
    async removeFile(path: string): Promise<any> {
        new Promise((resolve, rejct) => {
            fs.unlink(path, (err) => {
                if (err) {
                    console.error(err)
                    rejct(err)
                }
                resolve("done")
                //file removed
            })
        })
    }
    private prepareUser(userDto: SignupBodyDto, hAccesstokenData: HAccessTokenData, rehasehdNum: string): User {
        let newUser = new User();
        newUser._id = rehasehdNum;
        newUser.firstName = userDto.firstName;
        newUser.uid = hAccesstokenData.uid;
        newUser.hUid = hAccesstokenData.huid
        newUser.lastName = userDto.lastName
        newUser.isBlockedByAdmin = false
        return newUser;
    }

    async getPdf(firstName, lastName, uid: string) {
        try {
            //    await this.createPdf(firstName, lastName, uid)
            // await fs.readFile(`${uid}output.pdf`, )
            var file = fs.createReadStream(`${uid}output.pdf`);
            var stat = fs.statSync(`${uid}output.pdf`);

            // res.setHeader('Content-Length', stat.size);
            // res.setHeader('Content-Type', 'application/pdf');
            // res.setHeader('Content-Disposition', 'attachment; filename=quote.pdf');
            // file.pipe(res);
        } catch (e) {
            console.log(`Error white getting pdf ${e}`)
        }

    }

    private async createPdf(firstName, lastName, uid: string) {
        let pdfFilePath
        try {
            // Create a document
            const doc = new PDFDocument();
            pdfFilePath = doc.pipe(fs.createWriteStream(` ${uid}output.pdf`));
            // Embed a font, set the font size, and render some text
            doc
                .fontSize(25)
                .text(`firstName ${firstName}, lastName ${lastName}`, 100, 100);
            doc.end()
        } catch (e) {
            console.log(`Exception while creating pdf ${e}`)
        }
        return pdfFilePath
    }

    async sendVerificationEmail(email: string, uid: string) {
        const token = await this.getJwtToken(email, uid)
        // console.log(`user from db ${userInDb.firstName}`)
        const transporter = this.getTransporter()
        var mailOptions = {
            from: "Real Caller <realcallersprt@outlook.com>",
            to: email,
            subject: "Email verification",
            html: `
                    <h3>Please click on the lick below Verify your email for real caller</h3>
                   <h4> Ignore this, if not initiated by you.</h4>
                    <a href=http://192.168.43.34:8000/user/verifyEmail?value=${token}>http://192.168.43.34:8000/user/verifyEmail?value=${token}  </a>

                        `,
        };

        transporter.sendMail(mailOptions, function (error, response) {
            if (error) {
                console.log(error);
                // res.send("error");
            } else {
                console.log("Message sent: " + response);
                // res.send("sent");
            }
        });


    }

    private async getJwtToken(email: string, uid: string) {
        const privateKey = await this.getPrivateKey()
        return new Promise((resolve, reject) => {
            jwt.sign({ userEmail: email, uid: uid }, privateKey, { algorithm: 'RS256' }, function (err, token) {
                console.log(token);
                if (err) {
                    reject(err)
                } else {
                    resolve(token)
                }
            });
        })
    }





    private getTransporter() {
        const transporter = nodemailer.createTransport({
            host: "smtp.outlook.com",
            auth: {
                user: "realCallerSprt@outlook.com",
                pass: "Cena09876",
            },
        });
        return transporter
    }

    async sendPdf(query): Promise<any> {
        // verify a token symmetric
        // const  publickKeycert = fs.readFileSync('publickey.pem')
        try {
            const publickKeycert = await this.getPublicKeyBuffer()

            jwt.verify(query, publickKeycert, async (err, decoded) => {
                if (err) {
                    console.log(err)
                    // reject(err)
                } else {

                    console.log(decoded.userEmail)
                    const emailAndUid = new EmailAndUID()
                    emailAndUid.email = decoded.userEmail
                    emailAndUid.uid = decoded.uid
                    const userInDb = await this.db.collection(CollectionNames.USERS_COLLECTION).findOne({ uid: emailAndUid.uid })
                    //get user  contacts 

                    const transporter = this.getTransporter()
                    //below are for sending email with pdf
                    const pdf = await this.createPdf(userInDb.firstName, userInDb.lastName, emailAndUid.uid)

                    var mailOptions = {
                        from: "Real Caller <realCallerSprt@outlook.com>",
                        to: emailAndUid.email,
                        subject: "User data",
                        // html: `
                        //     <h3>User Data</h3>
                        //     <ul>
                        //         <li>firstName: ${userInDb.firstName} </li>
                        //         <li>lastName: ${userInDb.lastName} </li>
                        //     </ul>
                        //         `,
                        attachments: pdf
                    };

                    transporter.sendMail(mailOptions, function (error, response) {
                        if (error) {
                            console.log(error);
                            // res.send("error");
                        } else {
                            console.log("Message sent: " + response);
                            // res.send("sent");
                        }
                    });

                }
                // console.log(decoded.foo) // bar
            });
            // return

        } catch (e) {
            console.log(`exception while sending pdf ${e}`)
        }


    }
    async deactivate(tokenData: HAccessTokenData): Promise<GenericServiceResponseItem<any>> {
    //    const result = await 
       try {
        const processList = [
            this.db.collection(CollectionNames.USERS_COLLECTION).deleteOne({hUid: tokenData.huid}),
            this.db.collection(CollectionNames.MY_CONTACTS).deleteOne({_id: tokenData.huid })

        ]
       const [resUserColl, resMyContacts]  = await processHelper.doParallelProcess(processList)
        if(resUserColl.status == processHelper.FULL_FILLED){
            return GenericServiceResponseItem.returnGoodResponse("")
        }else {
            return GenericServiceResponseItem.returnSomethingWentWrong()
        }
    }catch(e){
           console.log('Exception while deactivating account ',e)
           return GenericServiceResponseItem.returnServerErrRes()
       }
        
    }

    async verifyAndGetEmail(query) {

        // const publickKeycert = fs.readFileSync(path.resolve(__dirname,"publickey.pem" ))
        // const publickKeycert = fs.readFileSync("/publickey.pem" )
        const publickKeycert = await this.getPublicKeyBuffer()
        try {
            jwt.verify(query, publickKeycert, function (err, decoded) {
                if (err) {
                    console.log(err)
                    // reject(err)
                } else {
                    console.log('decoded token')
                    console.log(decoded.userEmail)
                    const obj = new EmailAndUID()
                    obj.email = decoded.userEmail
                    obj.uid = decoded.uid
                    // resolve(obj)
                    return

                }
                // console.log(decoded.foo) // bar
            });
        } catch (e) {
            console.log(e)
        }

    }
    private async getPublicKeyBuffer() {
        try {
            let publickey = '-----BEGIN PUBLIC KEY-----\n' +
                'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA3v1VEHAxdav2qsGgkS8T\n' +
                '8/QRCAoPrTojl67qmL2tJ34wIH64ySWDRUyqetTcsWV+NfBANrE6QioFVgpl+Tyx\n' +
                'P4LG7ANGeID4A1k0oBExhlpaQ6SK3noYiFIh444IpXel3fw1UQ0yFhWkJaLUoP1Z\n' +
                'OPX/y8pXv7uiGGXJdC1Xcw3bVfNUBcl7DRl/tlHy/YTstaoqlxILZxqTLoKLCGQS\n' +
                'Uuu0dWMlpfbFdURjzCcWURJr5SyUeg3nSdguxBHSGXIWkRQ0eGoLiOS/G107pJrU\n' +
                'bbOjg849y9SNMRLUVtWrShsC2hA7PhIurXVRZsqrAhOTCUob4GFG8SPFg05Ti1p4\n' +
                '9wIDAQAB\n' +
                '-----END PUBLIC KEY-----'
            return await Buffer.from(publickey, "utf-8")
        } catch (e) {
            console.log(e)
        }
    }


    private async getPrivateKey() {
        return '-----BEGIN PRIVATE KEY-----\n' +
            'MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDe/VUQcDF1q/aq\n' +
            'waCRLxPz9BEICg+tOiOXruqYva0nfjAgfrjJJYNFTKp61NyxZX418EA2sTpCKgVW\n' +
            'CmX5PLE/gsbsA0Z4gPgDWTSgETGGWlpDpIreehiIUiHjjgild6Xd/DVRDTIWFaQl\n' +
            'otSg/Vk49f/Lyle/u6IYZcl0LVdzDdtV81QFyXsNGX+2UfL9hOy1qiqXEgtnGpMu\n' +
            'gosIZBJS67R1YyWl9sV1RGPMJxZREmvlLJR6DedJ2C7EEdIZchaRFDR4aguI5L8b\n' +
            'XTukmtRts6ODzj3L1I0xEtRW1atKGwLaEDs+Ei6tdVFmyqsCE5MJShvgYUbxI8WD\n' +
            'TlOLWnj3AgMBAAECggEBAMmF8UZ13n0V+ErByrbq8QFb5bh6P0iyblA7CFEZuk8i\n' +
            'v6PeYmmGuWf7rWZs0TaRHsroYWAMMzZwe3oS0623qAhZzCSnoRxukbWU/PZcE4H0\n' +
            'Tfcr0UTW2yz37SCV0EKaKxC/SgACCO3kiQBqc/c6f1P3HkGykDL7A7dA5htUjt+u\n' +
            'Sgs3AhMP8dB1cmae7IlpBxcS0NNc+CRsZu8Dd7U7PGItv8d620EJ1lyoSkNDUuDL\n' +
            'n4l2bbtSJJgOEHVF469vmpeZqKPbE2z7+vud3DMSIc8Qw4AqOJSOMFk62vhqsslQ\n' +
            'fwsWEqPLVt1FubV4XYIaRMU1o6+Vx7Lg7G6qasoFJ+ECgYEA+Dnq/rQsPMHCo+T7\n' +
            'wxC5EcLXE4fLUg0cibUWpVJ+uivSxkmpRaF3awik1abrfufco8xNurmCwnG/Tx+V\n' +
            '5Sfjx51O0LL8qx+ZPwlYPE+S1Xb7w5C1eje1rcBj+wrZLjj7UXlgj/gvVIWafeJy\n' +
            'Eq8WWfplS9BImMoQS+0dU4yt+DUCgYEA5fkWMY5TLEb8UgpZt8OfyHu6l4InmxJ/\n' +
            '3SFXHw42mKKRKu/O0VKAUvHTEHAsnBz0SfxRU0l9vsbmeT3uon2rhKxHiotNbe5f\n' +
            'MVZk8+rU1WmuBrUxuetVDZHu9LzghKghTJnoivOZQhhg4/ZgSwf4/e6AOIS49BoA\n' +
            'uB+KiLcdSfsCgYAQLT4aUUWcxAfaRH7/zGQzOx5nIG9oroAQnWOXbJPjsB1xXLWS\n' +
            'Wx58NDkBz3oDcDrZ1eOu6o4R+/W6w1UydPIMPT04rqF2yX1kNUixzYHFNZbcvN6G\n' +
            '04CcjTA22RMkRwRh3+YiG8uB158k2xASFaUAQig905oXkvuS5yYFHuLrjQKBgQC6\n' +
            'eKJ6REFEobpue14MF180HL9Loomiv/lVwHb4A3pZgVfcTN6R9CeBGfxeU9aYLxIV\n' +
            '+7Wlpu2DB5xRqtoYf3XX+il4OUPrY2Fki/0Hmt5AvZQSdFGBw0QP4Mi1QYF7jyiR\n' +
            'CCr6oFMguMu3jErADBLlM8JcEaI2q+7xXQHjoTbqiQKBgHDvrMV3n9QM7aNyW4SI\n' +
            'fhJucIR0gUr9ZUaOA1eeKeWQP+P57EEF/COu9o7mlWQHQEefJvb8z3/lfKarXdQq\n' +
            'tZpWX1UVfIJpuXYOcuAp9Xeh52Lbm0pkXA2O/7QUOXQyXTgQzNsa5622c+MAe7++\n' +
            'BAEeWblgNBq3AjP6YcAp1OnW\n' +
            '-----END PRIVATE KEY-----'
    }


}


