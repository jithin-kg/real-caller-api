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
          fileFilter:imageFileFilter,
          limits:{fileSize:10000}
        }),)
    async signUp
        (
        @Req() reqest: any,
        @UploadedFile() file: Express.Multer.File,
        @Body() body:SignupBodyDto
         ) {

        const userId = await FirebaseMiddleware.getUserId(reqest)

        const user = await this.userService.signup(body, userId, file)
        return {"result":user};
        
       
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