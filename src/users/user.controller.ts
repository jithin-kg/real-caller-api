import {
    Controller,
    Post,
    Body,
    Get,
    UseInterceptors,
    UploadedFile,
    Req,
    HttpException,
    HttpStatus
} from "@nestjs/common";
import { Userservice } from "./user.service";
import { UserDto } from "./user.dto";
import { UserInfoRequest } from "./userinfoRequest.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import {editFileName, imageFileFilter } from './file/file-upload.utils'
import {diskStorage} from 'multer'
import { FirebaseMiddleware } from "src/auth/firebase.middleware";
import { SignupBodyDto } from "./singupBody";
import {Formatter} from "./Formatter";
import {UserInfoByMailRequestDTO} from "./UserInfoByMailRequestDTO";
@Controller('user')
export class Usercontroller {
    constructor(private readonly userService: Userservice) { }

    /**
     * function to return phone number from token
     * @param param
     */
    @Post("getInfo")
    async  getPhoneNumberFromToken(@Req() reqest: any,@Body() param:UserInfoRequest):Promise<any>{
        const phonenumber:string = await FirebaseMiddleware.getPhoneNumberFromToken(reqest)
        return {message:phonenumber}
    }

    @Post("getUserInfoByMail")
    async getUserDataByMail(@Req() reqest: UserInfoByMailRequestDTO){
        console.log(`inside get email ${(reqest as any).body.email}`)
       await this.userService.getUserDataByMail((reqest as any).body.email,
           (reqest as any).body.uid )
        return{code:"200"}
    }

    /**
     * This route is used to create custom token for user, with hUserid
     * @param reqest
     * @param userInfo
     */
    @Post("getUserInfoForUid")
    async getUserInfo(@Req() reqest: any, @Body()userInfo: UserInfoRequest ){
        console.log("inside getUserInfoForUid")
       let user;
        const id = userInfo.uid;
        const phoneNumInToken:string = await FirebaseMiddleware.getPhoneNumberFromToken(reqest)
       const formatedNum = Formatter.getFormatedPhoneNumber(phoneNumInToken)
        const formatedNumInRequestBody = Formatter.getFormatedPhoneNumber(userInfo.formattedPhoneNum)
        if(formatedNum == formatedNumInRequestBody){
             user =  await this.userService.getUserInfoByid(id, userInfo.hashedNum)

            if(user.isBlockedByAdmin) {
                console.log('user  blocked by admin')
                throw new HttpException("Bad request" , HttpStatus.FORBIDDEN)
            }else {
                console.log('user not blocked by admin')
            }
        try{
            const removedUserPhoneNumber = await FirebaseMiddleware.removeUserPhoneNumberFromFirebase(id)
        }catch(e){
            console.log(`Error while removing phone number from firebase ${e}`)
        }
        }else{
            throw new HttpException("Bad request", 400)
        }
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
          limits:{fileSize:35000}
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

    @Post('updateUserInfo')
    @UseInterceptors(FileInterceptor('image', {
        storage: diskStorage({
            destination: './files',
            filename: editFileName,
          }),
          fileFilter:imageFileFilter,
          limits:{fileSize:35000}
        }))
    async update
        (
        @Req() reqest: any,
        @UploadedFile() file: Express.Multer.File,
        @Body() body:SignupBodyDto
         ) {

        const userId = await FirebaseMiddleware.getUserId(reqest)
        const user = await this.userService.updateUserInfo(body, userId, file)
        return {"result":user};
    }
    // validateRequest(request: any) {
    //    if(request.body.firstName)
    // }
    @Get('test')
    async test(){
        return {message:"hi"};
    }

}