import { processHelper } from './../utils/processHelper';
import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { validateOrReject } from "class-validator";
import * as fs from 'fs';
import * as jwt from "jsonwebtoken";
import { Db, UnorderedBulkOperation } from "mongodb";
import * as nodemailer from "nodemailer";
import * as PDFDocument from "pdfkit";
import { DatabaseModule } from "src/db/Database.Module";
import { FirebaseMiddleware } from "../auth/firebase.middleware";
import { Indiaprefixlocationmaps } from "../carrierService/carrier.info.schema";
import { CarrierService } from "../carrierService/carrier.service";
import { CollectionNames } from "../db/collection.names";
import { ContactObjectTransformHelper } from "../utils/ContactObjectTransformHelper";
import { NumberTransformService } from "../utils/numbertransform.service";
import { UserIdDTO } from "../utils/UserId.DTO";
import { EmailAndUID } from "./dto/EmailAndUID";
import { Formatter } from './Formatter';
import { SignupBodyDto } from "./dto/singupBody";
import { UserDoc } from "./dto/user.doc";
import { UserInfoRequest } from './dto/userinfoRequest.dto';
import { GenericServiceResponseItem } from 'src/utils/Generic.ServiceResponseItem';
import { HttpMessage } from 'src/utils/Http-message.enum';
import { HAccessTokenData } from 'src/auth/accessToken.dto';
import { DeactivateDTO } from './dto/deactivate.dto';
import { ContactDocument, CurrentlyActiveAvatar, UserUploadedContacts } from 'src/contactManage/dto/contactDocument';
import { IdType, NameAndUpvotes, PhoneNumNamAndUploaderDoc } from 'src/contactManage/dto/phoneNumNameUploaderAssocDoc';
import { DeleteMyDataDoc } from './dto/deletemydata.doc';
import { ContactProcessingItem } from 'src/contactManage/dto/contactProcessingItem';
import { UpdateProfileBody } from './updateProfileBody';
import { UserInfoResponseDTO } from './dto/userResponse.dto';
import { UpdateProfileResponseDTO } from './dto/updateProfileResponse.dto';
import { UserDto } from './dto/user.dto';
import { UpdateProfileWithGoogleDTO } from './dto/updateProfileBodyWithGoogle';
import { SignupWithGoogleDto } from './dto/signupWithGoogleDto';
import { query } from 'express';
import { SpamerType } from 'src/spam/dto/spam.type';


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
    
                    const _parallelProcessFunctions = [
                        this.db.collection(CollectionNames.USERS_COLLECTION).findOne({ _id: rehashedNum }),
                        FirebaseMiddleware.createCustomToken(id, rehashedNum)
                    ];
    
                    const [resUser,resFirebase ] = await processHelper.doParallelProcess(_parallelProcessFunctions);

                    // let result = Object.create(null); //to store userInfo
                    // if (parallelRes && parallelRes[0]) result = parallelRes[0].value;
                    const CUSTOM_TOKEN: string =  resFirebase.value

                    const user = new UserInfoResponseDTO()
                    user.customToken = CUSTOM_TOKEN;
                    // const doc = resUser.value as UserDoc
                    if (resUser.value) { //result != null || result != undefined
                        const doc = resUser.value as UserDoc
                        // user.email = result.email
                        user.firstName = doc.firstName
                        user.lastName = doc.lastName
                        user.bio = doc.bio
                        user.email = doc.email??""
                        user.avatarGoogle = doc.avatarGoogle
                        user.isVerifiedUser = doc.isVerifiedUser
                        if(doc.currentlyActiveAvatar == CurrentlyActiveAvatar.GOOGLE){
                            user.image = ""
                        }else if(doc.currentlyActiveAvatar == CurrentlyActiveAvatar.OTHER){
                            user.avatarGoogle = ""
                            user.image = doc.image.toString("base64")
                        }
                        //todo remove this in production, this is for project only
    
                        if (doc.isBlockedByAdmin) {
                            user.isBlockedByAdmin = 1
                            await FirebaseMiddleware.desableUser(id)
                        } else {
                            //only create custom token if user is not blocked by admin
                            // const customToken: string = await FirebaseMiddleware.createCustomToken(id, rehashedNum)
                            user.customToken = CUSTOM_TOKEN;
                            user.isBlockedByAdmin = 0
                        }
    
                        let updationOp = { $set: { "uid": id } }
                        let existingUId = doc.uid
                        try {
                            const _parallelProcessFunctions = [
                                this.db.collection(CollectionNames.USERS_COLLECTION).updateOne({ _id: rehashedNum }, updationOp),
                                FirebaseMiddleware.removeUserById(existingUId)
                            ]
                            await processHelper.doParallelProcess(_parallelProcessFunctions);
                        } catch (e) {
                            console.log(e)
                        }
                        // console.timeEnd("getUserInfoByid")
                        resolve(user);
                        return;
                    } 
                    // else {
                    //     user.customToken = CUSTOM_TOKEN;
                    // }
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
    async getUserInformationById( userInfo: UserInfoRequest): Promise<GenericServiceResponseItem<UserInfoResponseDTO>> {
        return new Promise(async (resolve) => {
            // console.time("getUserInfo");
            try {
                let user: UserInfoResponseDTO;
                const id = userInfo.tokenData.uid;
                // const phoneNumInToken: string = await FirebaseMiddleware.getPhoneNumberFromToken(req)
                const phoneNumInToken: string = userInfo.tokenData.phoneNumber

                if (!phoneNumInToken) {
                    resolve(GenericServiceResponseItem.returnBadRequestResponse())
                    return; // this is important to end function execution after resolve or reject
                }

                const formatedNum = Formatter.getFormatedPhoneNumber(phoneNumInToken)
                // const formatedNumInRequestBody = Formatter.getFormatedPhoneNumber(userInfo.formattedPhoneNum);
                // if (formatedNum == formatedNumInRequestBody) {
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
                            // reject(new HttpException("Bad request", HttpStatus.FORBIDDEN))
                            resolve(GenericServiceResponseItem.returnBadRequestResponse())
                            return
                        } else {
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
                // } else {
                //     // reject(new HttpException("Bad request", 400))
                //     resolve(GenericServiceResponseItem.returnBadRequestResponse())
                //     return
                // }
            } catch (e) {
                console.log(`Exception while getUserInformationById ${e}`)
                resolve(GenericServiceResponseItem.returnServerErrRes())
                return;
            }


        })
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
    async signupWithGoogle(userDto: SignupWithGoogleDto) {
        try {

            const rehasehdNum = await this.numberTransformService.tranforNum(userDto.hashedNum)
            const user = await this.db.collection(CollectionNames.USERS_COLLECTION).findOne({ _id: rehasehdNum })
            if (user == null) {


                     //first signup the user
                     //then update or insert the user info in contacts collection
                     const newUser = new UserDoc()
                     newUser._id =  rehasehdNum
                     newUser.firstName = userDto.firstName
                     newUser.lastName = userDto.lastName
                     newUser.email = userDto.email
                     newUser.hUid = userDto.tokenData.huid
                     newUser.uid = userDto.tokenData.uid
                     newUser.avatarGoogle = userDto.avatarGoogle;
                     newUser.googelFname = userDto.firstName
                     newUser.googleLname = userDto.lastName
                     newUser.googleEmail = userDto.email




                     const contactsQuery = {
                         _id: rehasehdNum
                     }
                     const contact = new ContactDocument()
                     contact._id = rehasehdNum;
                     contact.firstName = userDto.firstName
                     contact.lastName = userDto.lastName
                     contact.email = userDto.email
                     contact.bio = userDto.bio;
                     contact.avatarGoogle = userDto.avatarGoogle
                     contact.hUid = userDto.tokenData.huid
                     delete contact.spamCount;
                     delete contact.spamerType;
                     const updateOp = {
                        $set: contact,
                        $setOnInsert: {
                            spamCount: 0,
                            spamerType: new SpamerType()
                        }
                     }
                     
                     const option = {
                         upsert: true
                     }
                     const processList = [
                         this.db.collection(CollectionNames.USERS_COLLECTION).insertOne(newUser),
                         this.db.collection(CollectionNames.CONTACTS_OF_COLLECTION).updateOne(contactsQuery, updateOp, option )
                     ]
                     const [resUser, resContacts] = await processHelper.doParallelProcess(processList)
                     delete userDto.tokenData
                     return GenericServiceResponseItem.returnGoodResponse(userDto, HttpStatus.CREATED)

            } else {
                 return GenericServiceResponseItem.returnBadRequestResponse(HttpMessage.USER_ALREADY_EXISTS);
            }
            // return GenericServiceResponseItem.returnGoodResponse(userDTO)
        } catch (e) {
            console.error(`error while updating user info ${e}`)
            return GenericServiceResponseItem.returnBadRequestResponse()
        }
    }
    async updateProfileWithgoogle(userDTO: UpdateProfileWithGoogleDTO) {
        try {
            let updationOp
            let updateContact

                updationOp = { $set: 
                    { "firstName": userDTO.firstName,
                     "lastName": userDTO.lastName,
                    "email":userDTO.email,
                    "bio":userDTO.bio,
                    "avatarGoogle":userDTO.avatarGoogle,
                    "currentlyActiveAvatar":CurrentlyActiveAvatar.GOOGLE,
                    "googelFname" : userDTO.googleProfile.firstName,
                    "googleLname" : userDTO.googleProfile.lastName,
                    "googleEmail" : userDTO.googleProfile.email,
                    } }

                    updateContact = {
                        $set: {
                            "firstName": userDTO.firstName,
                            "lastName": userDTO.lastName,
                            "bio":userDTO.bio,
                            "email": userDTO.email,
                            "avatarGoogle":userDTO.avatarGoogle,
                            "image": null
                        }
                    }
            const queryContacts = {
                hUid:userDTO.tokenData.huid
            }
            
       const processList =  [
            this.db.collection(CollectionNames.USERS_COLLECTION).updateOne({ hUid: userDTO.tokenData.huid }, updationOp),
            this.db.collection(CollectionNames.CONTACTS_OF_COLLECTION).updateOne(queryContacts,updateContact)
        ]
        const [resUser, resContact] =  await processHelper.doParallelProcess(processList)
          console.log(resUser)
        delete userDTO.tokenData
            return GenericServiceResponseItem.returnGoodResponse(userDTO)
        } catch (e) {
            console.error(`error while updating user info ${e}`)
            const user = new UserInfoResponseDTO()
            return GenericServiceResponseItem.returnBadRequestResponse()
        }
    }

    async updateUserInfo(userDTO: UpdateProfileBody, userIdDTO: UserIdDTO, imgFile: Express.Multer.File):Promise<GenericServiceResponseItem<UpdateProfileResponseDTO>> {
        try {
            let fileBuffer: Buffer = null
            fileBuffer = await this.getImageBuffer(imgFile)
            let updationOp
            let updateContact
            if (fileBuffer == null) {
                if(userDTO.gEmail != ""){
                    updationOp = { $set: 
                        { "firstName": userDTO.firstName,
                         "lastName": userDTO.lastName,
                        "email":userDTO.email,
                        "bio":userDTO.bio,
                        "googelFname": userDTO.gFName,
                        "googleLname": userDTO.gLName,
                        "googleEmail": userDTO.gEmail
                        } }
                }else {
                    updationOp = { $set: 
                        { "firstName": userDTO.firstName,
                         "lastName": userDTO.lastName,
                        "email":userDTO.email,
                        "bio":userDTO.bio,
                        } }
                }
                

                    updateContact = {
                        $set: {
                            "bio":userDTO.bio,
                            "email": userDTO.email,
                            "avatarGoogle": ""
                        }
                    }
            } else {
                if(userDTO.gEmail != ""){
                    updationOp = { $set: { 
                        "firstName":  userDTO.firstName, 
                        "lastName": userDTO.lastName, 
                        "email":userDTO.email,
                        "bio":userDTO.bio,
                        "image": fileBuffer,
                        "googelFname": userDTO.gFName,
                        "googleLname": userDTO.gLName,
                        "googleEmail": userDTO.gEmail,
                        "currentlyActiveAvatar": CurrentlyActiveAvatar.OTHER
                    
                    } }
                }else {
                    updationOp = { $set: { 
                        "firstName":  userDTO.firstName, 
                        "lastName": userDTO.lastName, 
                        "email":userDTO.email,
                        "bio":userDTO.bio,
                        "image": fileBuffer,
                        "currentlyActiveAvatar": CurrentlyActiveAvatar.OTHER
                    } }
                }
                
            updateContact = {
                $set: {
                    "bio":userDTO.bio,
                    "email": userDTO.email,
                    "image": fileBuffer,
                    "avatarGoogle": ""

                }
            }
                    
            }
            const queryContacts = {
                hUid:userIdDTO.hUserId
            }
            
       const result =  [
            this.db.collection(CollectionNames.USERS_COLLECTION).updateOne({ hUid: userIdDTO.hUserId }, updationOp),
            this.db.collection(CollectionNames.CONTACTS_OF_COLLECTION).updateOne(queryContacts,updateContact)
        ]
        await processHelper.doParallelProcess(result)
            const user = new UpdateProfileResponseDTO()
            user.firstName = userDTO.firstName
            user.lastName = userDTO.lastName
            user.email = userDTO.email;
            user.bio = userDTO.bio
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
                docToInsert.hUid = hAccesstokenData.huid;

               delete docToInsert.spamCount;
                const res = await this.db.collection(CollectionNames.CONTACTS_OF_COLLECTION)
                .updateOne({ _id: docToInsert._id },
                    {$inc:{"spamCount":0} ,
                     $set:docToInsert,
                     $setOnInsert:{
                        spamerType: new SpamerType()
                     }
                    }, { upsert: true })
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
                let newUser :UserDoc= await this.prepareUser(userDto, hAccesstokenData, rehasehdNum);
                newUser.image = fileBuffer //setting image buffer to insert
                if(fileBuffer != null){
                    newUser.currentlyActiveAvatar = CurrentlyActiveAvatar.OTHER
                }
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
    private prepareUser(userDto: SignupBodyDto, hAccesstokenData: HAccessTokenData, rehasehdNum: string): UserDoc {
        let newUser = new UserDoc();
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
       try {
        const userDoc = await this.db.collection(CollectionNames.USERS_COLLECTION).findOne({hUid:tokenData.huid}) as UserDoc
        const deleteMyDataDoc = new DeleteMyDataDoc()
        deleteMyDataDoc._id = userDoc._id;
        deleteMyDataDoc.hUid = userDoc.hUid;
        // await this.removeOrUpdateContact(tokenData)
        const processList = [
            this.db.collection(CollectionNames.USERS_COLLECTION).deleteOne({hUid: tokenData.huid}),
            this.db.collection(CollectionNames.MY_CONTACTS).deleteOne({_id: tokenData.huid }),
            this.db.collection(CollectionNames.DELETE_MY_DATA_REQUESTS).insertOne(deleteMyDataDoc),
            FirebaseMiddleware.removeUserById(tokenData.uid)
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
    async removeOrUpdateContact(tokenData: HAccessTokenData) {
      try{
        let doc = await this.db.collection(CollectionNames.REHASHED_NUMS_OF_USER).findOne({_id: tokenData.huid})  as UserUploadedContacts
        const bulkOpContactsOfuser: UnorderedBulkOperation = this.db.collection(CollectionNames.CONTACTS_OF_COLLECTION).initializeUnorderedBulkOp()
        const bulkOpPhoneNumUploaderAssoc: UnorderedBulkOperation = this.db.collection(CollectionNames.PHONE_NUM_AND_NAME_ASSOCIATION).initializeUnorderedBulkOp()
        
       return new Promise((resolve, reject)=> {
           Promise.resolve().then(async res=> {
               for(let rehashedNum of doc.rehasehdNums){
                   const docPhoneNumUploderAssoc = await this.db.collection(CollectionNames.PHONE_NUM_AND_NAME_ASSOCIATION).findOne({_id: rehashedNum}) as  IdType<NameAndUpvotes>
                   if(docPhoneNumUploderAssoc[tokenData.huid] !=undefined){
                     //check if name in contact collection is same as this
                     const contactDoc = await this.db.collection(CollectionNames.CONTACTS_OF_COLLECTION).findOne({_id: rehashedNum})  as ContactDocument
                     if(contactDoc.hUid == null ||  contactDoc.hUid == undefined || contactDoc.hUid == ''){
                         //not regitstered user
                        
                         if(contactDoc.nameInPhoneBook == docPhoneNumUploderAssoc[tokenData.huid].nameInPhoneBook){
                            let updateOperation ;
                            let isUpdatable = false;
                             //names are same, update with another name 
                             //delete key from returned  phonenumUploaderAssoc
                             delete docPhoneNumUploderAssoc[tokenData.huid];
                             let arrOfValues = Object.values(docPhoneNumUploderAssoc) 
                             if(arrOfValues != null && arrOfValues.length >1 ){
                                 //get the new name, 0 is _id value, so take value at position > 0   
                                 let newName = arrOfValues[1];
                                 isUpdatable = true
                                 updateOperation = {
                                     "firstName": newName
                                 }
                             }else if( arrOfValues != null && arrOfValues.length == 1){
                                 //this was the only uploader uploaded this number
                                 updateOperation = {
                                     "firstName": ''
                                 }
                                 isUpdatable = true;
                             }
                             if(isUpdatable) {
                                 bulkOpContactsOfuser.find({_id: rehashedNum}).updateOne({$set: updateOperation})
                             }     
                         }
                     }
                   }  
                   const hUid = tokenData.huid
                   bulkOpPhoneNumUploaderAssoc.find({_id: rehashedNum}).updateOne({$unset: hUid})
                 }

              const processes = [
                 bulkOpContactsOfuser.execute(),
                 bulkOpPhoneNumUploaderAssoc.execute(),
                 this.db.collection(CollectionNames.MY_CONTACTS).deleteOne({hUid:tokenData.huid}),
                 this.db.collection(CollectionNames.USERS_COLLECTION).deleteOne({hUid:tokenData.huid}),
                 this.db.collection(CollectionNames.CONTACTS_OF_COLLECTION).updateOne({hUid:tokenData.huid}, {$set: {hUid:""}})
                ]
             let [updateContactsUser,
                 updatePhoneNumUploader
                ] = await processHelper.doParallelProcess(processes)
           })
       })
      }catch(e){
          console.log(e)
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


