import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { Model } from 'mongoose'

import { UserDto } from "./user.dto";
import { User } from "./user.schema";
import { InjectModel } from "@nestjs/mongoose";
import { validateOrReject } from "class-validator";
import { async } from "rxjs";
import { create } from "domain";


@Injectable()
export class Userservice {
    constructor(@InjectModel("User") private readonly userModel: Model<User>) { }

    async signup(userDto: UserDto): Promise<string> {
        
        
      try{
    
       
          const user = await this.userModel.findOne({uid:userDto.uid})
          if(user== null ){
            await validateOrReject(userDto) //validation
              try{  
                const createdUser = new this.userModel(userDto);
               
                const savedUser = await createdUser.save()
                console.log("user from database is " + savedUser)
                
                return "1"
              }catch(err){
                  console.log("error while saving", err);
                  return "0"
              }
          }else{
              console.log("user exist")
              return "1";
          }
          
      }catch(err){
          console.log("validation erros ", err);
          return "0"
      }
        
        
        // console.log()
        // return "1"
        //TODO check for bad request by validating fields , empty

        // console.log("service user dto is"+ userDto);
        // const createduser = new this.userModel(userDto);
        // console.log("req body firebase user id "+ userDto.uid)
        // const user = await this.userModel.findOne({firebaseUserId:userDto.uid})
        // console.log("user found is "+user);
        // return "1"
        // if(user == null){
        //    throw new HttpException("Bad request", HttpStatus.BAD_REQUEST) 
        // }

        // console.log('user service created user is ' + createduser)
        // const result = await createduser.save();
        // return result.id;
        // return "1"
    }
  
}