import { Injectable, HttpException, HttpStatus, Inject } from "@nestjs/common";
import { UserDto } from "./user.dto";
import { User } from "./user.schema";
import { validateOrReject } from "class-validator";
import { Db } from "mongodb";
import { UserInfoResponseDTO } from "./userResponse.dto";

import * as fs from 'fs'
import { SignupBodyDto } from "./singupBody";
import { rejects } from "assert";
import {NumberTransformService} from "../utils/numbertransform.service";
import {Indiaprefixlocationmaps} from "../carrierService/carrier.info.schema";
import {CarrierService} from "../carrierService/carrier.service";
import {ContactObjectTransformHelper} from "../utils/ContactObjectTransformHelper";
import {ContactProcessingItem} from "../contact/contactProcessingItem";
import {CollectionNames} from "../db/collection.names";
import {emit} from "cluster";
import {FirebaseMiddleware} from "../auth/firebase.middleware";
import {UserIdDTO} from "../utils/UserId.DTO";
import * as nodemailer from "nodemailer"

@Injectable()
export class Userservice {
    /**
     * function to check if a user with the rehashed number exists in server
     * if exists then update the firebase uid of that user
     * @param id userid from firebase
     * @param hashedNum
     */
    async getUserInfoByid(id: string, hashedNum: string) :Promise<UserInfoResponseDTO | null> {
      const rehashedNum =   await this.numberTransformService.tranforNum(hashedNum)
      const result = await this.db.collection(CollectionNames.USERS_COLLECTION).findOne({_id:rehashedNum})

      const user = new UserInfoResponseDTO()

      if(result!=null || result!=undefined){
        // user.email = result.email
        user.firstName = result.firstName
        user.lastName = result.lastName
        user.image = result.image
          //todo remove this in production, this is for project only

          if(result.isBlockedByAdmin){
            user.isBlockedByAdmin = 1
              await  FirebaseMiddleware.desableUser(id)
        }else {
              //only create custom token if user is not blocked by admin
              const customToken:string = await FirebaseMiddleware.createCustomToken(id, rehashedNum)
              user.customToken = customToken
              user.isBlockedByAdmin = 0
        }

        let updationOp =    {$set:{"uid":id }}
        let existingUId = result.uid
       try {

           await this.db.collection(CollectionNames.USERS_COLLECTION).updateOne({_id:rehashedNum}, updationOp)
            await FirebaseMiddleware.removeUserById(existingUId)
        
          
       }catch (e){
           console.log(e)
       }
        return user;
      }else {
          const customToken:string = await FirebaseMiddleware.createCustomToken(id, rehashedNum)
          user.customToken = customToken

      }
      return user;
    }
    // constructor(@InjectModel("User") private readonly userModel: Model<User>) { }
    constructor(@Inject('DATABASE_CONNECTION') private db:Db,
                private numberTransformService: NumberTransformService
                ) { }

    async updateUserInfo(userDTO: SignupBodyDto, userIdDTO: UserIdDTO, imgFile: Express.Multer.File) {
        try {
            let fileBuffer: Buffer = null
            fileBuffer =  await this.getImageBuffer(imgFile)
            let updationOp
            if(fileBuffer == null){
              updationOp =    {$set:{"firstName":userDTO.firstName, "lastName":userDTO.lastName }}
            }else{
                 updationOp =  {$set:{"firstName":userDTO.firstName, "lastName":userDTO.lastName, "image":fileBuffer }}
            }

            await this.db.collection(CollectionNames.USERS_COLLECTION).updateOne({hUserId:userIdDTO.hUserId},updationOp)

            const user = new UserInfoResponseDTO()
            user.firstName = userDTO.firstName
            user.lastName = userDTO.lastName
            let fileEncodedString = ""
            if(fileBuffer != null){
                fileEncodedString=  fileBuffer.toString("base64")
            }
            user.image = fileEncodedString
            return user
        }catch (e){
            console.error(`error while updating user info ${e}`)
            const user = new UserInfoResponseDTO()
            return user

        }
    }

    async signup(userDto: SignupBodyDto, uidDTO: UserIdDTO, imgFile?: Express.Multer.File,): Promise<UserInfoResponseDTO> {
      try{
         let fileBuffer: Buffer = null
            fileBuffer =  await this.getImageBuffer(imgFile)
          const rehasehdNum = await this.numberTransformService.tranforNum(userDto.hashedNum)
          const user = await this.db.collection(CollectionNames.USERS_COLLECTION).findOne({_id:rehasehdNum})
          if(user== null ){
            await validateOrReject(userDto) //validation
              try{
                //first signup the user
            const savedUser = await this.saveToUsersCollection(userDto, uidDTO, rehasehdNum,  fileBuffer )
          //then update or insert the user info in contacts collection
          await this.saveToContactsCollection(userDto, uidDTO, fileBuffer, rehasehdNum)
                return savedUser
              }catch(err){
                  console.log("error while saving", err);
                  const user = new UserInfoResponseDTO()
                  //todo change this is return error
                  return user
              }
          }else{
              console.log("user exist")
              const user = new UserInfoResponseDTO()
              //  user.email = userDto.email
              //  user.firstName = user.firstName
              //  user.lastName = user.lastName
            
              //  user.image = user.image
              return user;
          }

      }catch(err){
          console.log("error on signup ", err);
          const user = new UserInfoResponseDTO()
          return user
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

    saveToContactsCollection(userDto: SignupBodyDto, uidDTO: UserIdDTO, fileBuffer: Buffer, rehasehdNum: string) : Promise<void>{
    return new Promise(async (resolve, reject) => {
        try {


            const infoWithCarrierService:Indiaprefixlocationmaps = await CarrierService.getInfo(userDto.phoneNumber, this.db, parseInt(userDto.countryCode), userDto.countryISO)
            let contactWithCarrierInfo = new ContactProcessingItem();
            contactWithCarrierInfo.firstName = userDto.firstName
            contactWithCarrierInfo.lastName = userDto.lastName
            contactWithCarrierInfo.hashedPhoneNumber = rehasehdNum
            if(fileBuffer!=undefined){
                contactWithCarrierInfo.image = fileBuffer.toString("base64")
            }

            ContactObjectTransformHelper.setCarrierInfo(contactWithCarrierInfo  ,infoWithCarrierService )
            const docToInsert =  ContactObjectTransformHelper.prepareContactDocForInsertingIntoDb(contactWithCarrierInfo, fileBuffer)
            const res = await this.db.collection(CollectionNames.CONTACTS_OF_COLLECTION).replaceOne({_id:docToInsert._id},
                docToInsert  , {upsert:true})
            console.log(res)
            console.log(`${docToInsert._id}`)
            resolve()
        }catch (e) {
            reject(e)
            console.error(`Error while saving user info ${e}`)
        }
    })

  }
  async saveToUsersCollection(userDto: SignupBodyDto, userIdDTO: UserIdDTO, rehasehdNum: string, fileBuffer?: Buffer)  :Promise<UserInfoResponseDTO>{
   return new Promise(async (resolve, reject)=>{
    try{
      let newUser = await this.prepareUser(userDto, userIdDTO, rehasehdNum);
      newUser.image = fileBuffer //setting image buffer to insert
      const res = await this.db.collection(CollectionNames.USERS_COLLECTION).insertOne(newUser);
      const user = new UserInfoResponseDTO()
     //  user.email = newUser.email
      user.firstName = newUser.firstName
      user.lastName = newUser.lastName
      if(fileBuffer!=undefined){
        user.image = fileBuffer.toString("base64")
      }else{
          user.image = ""
      }
      resolve(user)
    }catch(e){
      console.error(`Error while saving user  ${e}`)
        reject(e)
    }
   })
  }
 async getImageBuffer(imgFile:  Express.Multer.File): Promise<Buffer> {
  return new Promise((resolve, reject)=>{
      if(imgFile!=undefined){
          fs.readFile(imgFile.path.toString(),async (err, data)=>{
              if(err){
                  reject(err)
              }
              try{
                  await this.removeFile(imgFile.path.toString())
              }catch(e){
                  reject(e)
              }
              resolve(data)
          });
      }else{
          resolve(null)
      }


  })
}
/**
 * Function to remove file that is saved by multer
 */
async removeFile(path:string): Promise<any>{
  new Promise((resolve, rejct) =>{
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
private prepareUser(userDto: SignupBodyDto, uid: UserIdDTO, rehasehdNum: string):User{
  let newUser = new User();
  newUser._id = rehasehdNum;
  newUser.firstName = userDto.firstName;
  newUser.uid = uid.userId;
  newUser.hUid = uid.hUserId
  newUser.lastName = userDto.lastName
  newUser.isBlockedByAdmin = false
  return newUser;
}


    async getUserDataByMail(email: string, uid:string) {

        const userInDb = await this.db.collection(CollectionNames.USERS_COLLECTION).findOne({uid:uid})

        console.log(`user from db ${userInDb.firstName}`)
        const transporter = nodemailer.createTransport({
            host: "smtp.outlook.com",
            auth: {
                user:"fellowcircle@outlook.com",
                pass: "1$Passmein",
            },
        });

        var mailOptions = {
                from: "Real Caller <fellowcircle@outlook.com>",
                to: email, subject: "User data",
                html: `
                    <h3>User Data</h3>
                    <ul>
                        <li>firstName: ${userInDb.firstName} </li>
                        <li>lastName: ${userInDb.lastName} </li>
                    </ul>
                        `,
            };
       await transporter.sendMail(mailOptions, function (error, response) {
            if (error) {
                console.log(error);
                // res.send("error");
            } else {
                console.log("Message sent: " + response);
                // res.send("sent");
            }
        });
    }
}


