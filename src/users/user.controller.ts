import { Controller, Post, Body, Get, UseInterceptors, UploadedFile, Req } from "@nestjs/common";
import { Userservice } from "./user.service";
import { UserDto } from "./user.dto";
import { UserInfoRequest } from "./userinfoRequest.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import {editFileName, imageFileFilter } from './file/file-upload.utils'
import {diskStorage} from 'multer'
import { FirebaseMiddleware } from "src/auth/firebase.middleware";
import { SignupBodyDto } from "./singupBody";
@Controller('user')
export class Usercontroller {
    constructor(private readonly userService: Userservice) { }


    @Post("getUserInfoForUid")
    async getUserInfo(@Body()param: UserInfoRequest ){
        const id = param.uid;
        console.log("getUserInfoForUid")
       const user =  await this.userService.getUserInfoByid(id)
         console.log(`returning user ${user}`)
        return {result: user}
    }
    @Post('signup')
    @UseInterceptors(FileInterceptor('image', {
        storage: diskStorage({
            destination: './files',
            filename: editFileName,
          }), 
          fileFilter:imageFileFilter}),)
    async signUp
        (
        @Req() reqest: any,
        @UploadedFile() file: Express.Multer.File,
        @Body() body:SignupBodyDto
         ) {

       
        const userId = await FirebaseMiddleware.getUserId(reqest)

        const user = await this.userService.signup(body, file, userId)
        return {"result":user};

        // this.validateRequest(reqest)

        
        // const secuser: UserDto = Object.create(null);


        // const user = new UserDto()
        // user.firstName = firstName;
        // user.lastName = lastName
        // user.uid = uid,
        // user.gender = "male"
        // user.phoneNumber = "sample"

        
    //   
        // const secuser: UserDto = new UserDto();
        // console.log(user)
        // secuser.firstName = user.firstName;
        // secuser.email = user.email;
        // // secuser.accountType = user.accountType== undefined ?"premium":"regular";
        // // secuser.accountType = user.accountType = "premium";
        // secuser.uid = user.uid;
        // // secuser.lastName = "123";
        // Object.freeze(secuser);
        
    
        // setTimeout(()=>{
        //  this.userService.signup(secuser).then(data=>{
        //      console.log("after 5 secs")
        //     return { message: data };
        //  })
            
        // }, 5000)
        // console.log(`result is ${result}`)
        // let result = await this.userService.signup(userInfo)
        // return {message:}
        
       
    }
    // validateRequest(request: any) {
    //    if(request.body.firstName)
    // }
    @Get('test')
    async test(){
        console.log("tessting");
        return {message:"hi"};
    }

}