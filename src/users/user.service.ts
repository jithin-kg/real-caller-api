import { Injectable, HttpException, HttpStatus, Inject } from "@nestjs/common";
import { UserDto } from "./user.dto";
import { User } from "./user.schema";
import { validateOrReject } from "class-validator";
import { Db } from "mongodb";
import { UserInfoResponseDTO } from "./userResponse.dto";

import * as fs from 'fs'
import { SignupBodyDto } from "./singupBody";

@Injectable()
export class Userservice {
    
    async getUserInfoByid(id: String) :Promise<UserInfoResponseDTO|null> {
      const result = await this.db.collection('users').findOne({uid:id})
      const user = new UserInfoResponseDTO()

      if(result!=null || result!=undefined){
        // user.email = result.email
        user.firstName = result.firstName
        user.lastName = result.lastName
        return user;
      }

      return user;
    }
    // constructor(@InjectModel("User") private readonly userModel: Model<User>) { }
    constructor(@Inject('DATABASE_CONNECTION') private db:Db ) { }

    async signup(userDto: SignupBodyDto, imgFile: Express.Multer.File, uid:string): Promise<UserInfoResponseDTO> {
        
      
      try{
         const fileBuffer: Buffer =  await this.getImageBuffer(imgFile)

          console.log(`user dto user id is ${uid}`);

          const user = await this.db.collection('users').findOne({uid:uid})
          console.log("user is "+user);

          if(user== null ){
            await validateOrReject(userDto) //validation
              try{  
               let newUser = await this.prepareUser(userDto, uid);
               newUser.image = fileBuffer //setting image buffer to insert 
               const res = await this.db.collection('users').insertOne(newUser);
               const user = new UserInfoResponseDTO()
              //  user.email = newUser.email
               user.firstName = newUser.firstName
               user.lastName = "sample"
               user.image = fileBuffer.toString("base64")
              //  user.gender = "sample"
                return user
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
               user.firstName = userDto.firstName
               user.lastName = ""
               user.image = ""
              //  user.gender = ""
              return user;
          }
          
      }catch(err){
          console.log("validation erros ", err);
          const user = new UserInfoResponseDTO()
          return user
      }
        
       
  
}
 async getImageBuffer(imgFile:  Express.Multer.File): Promise<Buffer> {
   
  return new Promise((resolve, reject)=>{
   fs.readFile(imgFile.path.toString(),(err, data)=>{
      if(err){
          reject(err)
      }
      resolve(data)
    });
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


