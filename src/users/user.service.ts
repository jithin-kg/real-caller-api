import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { Model } from 'mongoose'

import { UserDto } from "./user.dto";
import { User } from "./user.schema";
import { InjectModel } from "@nestjs/mongoose";
import { isNull } from "util";


@Injectable()
export class Userservice {
    constructor(@InjectModel("User") private readonly userModel: Model<User>) { }

    async signup(userDto: UserDto): Promise<string> {
        
        console.log(`-------------------------------------`)
        // console.log(`user is ${userDto}`);
        console.log('user service userDto ' + userDto.accountType)
        console.log('user service userDto ' + userDto.firstName)
        console.log('user service userDto ' + userDto.email)
        //TODO check for bad request by validating fields , empty

        // console.log("service user dto is"+ userDto);
        const createduser = new this.userModel(userDto);
        console.log("req body firebase user id "+ userDto.uid)
        const user = await this.userModel.findOne({firebaseUserId:userDto.uid})
        console.log("user found is "+user);
        // if(user == null){
        //    throw new HttpException("Bad request", HttpStatus.BAD_REQUEST) 
        // }

        // console.log('user service created user is ' + createduser)
        // const result = await createduser.save();
        // return result.id;
        return "1"
    }
}