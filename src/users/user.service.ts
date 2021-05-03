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

@Injectable()
export class Userservice {
    async getUserInfoByid(id: String) :Promise<UserInfoResponseDTO|null> {
      const result = await this.db.collection('users').findOne({uid:id})
      const user = new UserInfoResponseDTO()
      if(result!=null || result!=undefined){
        // user.email = result.email
        user.firstName = result.firstName
        user.lastName = result.lastName
        user.image = result.image
        return user;
      }
      return user;
    }
    // constructor(@InjectModel("User") private readonly userModel: Model<User>) { }
    constructor(@Inject('DATABASE_CONNECTION') private db:Db,
                private numberTransformService: NumberTransformService
                ) { }

    async updateUserInfo(userDTO: SignupBodyDto, userId: string, imgFile: Express.Multer.File) {
        try {
            let fileBuffer: Buffer = null
            fileBuffer =  await this.getImageBuffer(imgFile)
            let updationOp
            if(fileBuffer == null){
              updationOp =    {$set:{"firstName":userDTO.firstName, "lastName":userDTO.lastName }}
            }else{
                 updationOp =  {$set:{"firstName":userDTO.firstName, "lastName":userDTO.lastName, "image":fileBuffer }}
            }
            await this.db.collection(CollectionNames.USERS_COLLECTION).updateOne({uid:userId},updationOp)
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

    async signup(userDto: SignupBodyDto, uid:string, imgFile?: Express.Multer.File, ): Promise<UserInfoResponseDTO> {  
      try{
         let fileBuffer: Buffer = null
            fileBuffer =  await this.getImageBuffer(imgFile)
          console.log(`user dto user id is ${uid}`);
          const user = await this.db.collection(CollectionNames.USERS_COLLECTION).findOne({uid:uid})
          console.log("user is "+user);
          if(user== null ){
            await validateOrReject(userDto) //validation
              try{
                //first signup the user
            const savedUser = await this.saveToUsersCollection(userDto, uid, fileBuffer )
          //then update or insert the user info in contacts collection
          await this.saveToContactsCollection(userDto, uid, fileBuffer)
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
     * @param uid
     * @param fileBuffer
     */

   saveToContactsCollection(userDto: SignupBodyDto, uid: string, fileBuffer: Buffer) : Promise<void>{
    return new Promise(async (resolve, reject) => {
        try {
            const rehasehdNum = await this.numberTransformService.tranforNum(userDto.hashedNum)
            console.log(`rehashedNum is ${rehasehdNum}`)

            const infoWithCarrierService:Indiaprefixlocationmaps = await CarrierService.getInfo(userDto.phoneNumber, this.db, parseInt(userDto.countryCode), userDto.countryISO)
            let contactWithCarrierInfo = new ContactProcessingItem();
            contactWithCarrierInfo.firstName = userDto.firstName
            contactWithCarrierInfo.lastName = userDto.lastName
            contactWithCarrierInfo.hashedPhoneNumber = rehasehdNum
            ContactObjectTransformHelper.setCarrierInfo(contactWithCarrierInfo  ,infoWithCarrierService )
            const docToInsert =  ContactObjectTransformHelper.prepareContactDocForInsertingIntoDb(contactWithCarrierInfo)
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
  async saveToUsersCollection(userDto:SignupBodyDto, uid:string, fileBuffer?: Buffer)  :Promise<UserInfoResponseDTO>{
   return new Promise(async (resolve, reject)=>{
    try{
      let newUser = await this.prepareUser(userDto, uid);
      newUser.image = fileBuffer //setting image buffer to insert 
      const res = await this.db.collection(CollectionNames.USERS_COLLECTION).insertOne(newUser);
      const user = new UserInfoResponseDTO()
     //  user.email = newUser.email
      user.firstName = newUser.firstName
      user.lastName = "sample"
      if(fileBuffer!=undefined){
        user.image = fileBuffer.toString("base64")
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
private prepareUser(userDto:UserDto, uid:string):User{
  let newUser = new UserDto();
  // newUser.accountType = userDto.accountType;
  // newUser.email = userDto.email;
  newUser.firstName = userDto.firstName;
  newUser.uid = uid;
  // newUser.gender = userDto.gender
  // newUser.phoneNumber = userDto.phoneNumber;
  newUser.lastName = userDto.lastName
  
  return newUser;
}


}


