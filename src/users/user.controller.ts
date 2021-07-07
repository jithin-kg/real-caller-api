import {
    Body, Controller, Get, Post, Query, Req, UploadedFile, UseInterceptors
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from 'multer';
import { FirebaseMiddleware } from "src/auth/firebase.middleware";
import { editFileName, imageFileFilter } from './file/file-upload.utils';
import { SignupBodyDto } from "./singupBody";
import { Userservice } from "./user.service";
import { UserInfoByMailRequestDTO } from "./UserInfoByMailRequestDTO";
import { UserInfoRequest } from "./userinfoRequest.dto";

@Controller('user')
export class Usercontroller {
    constructor(private readonly userService: Userservice) { }

    /**
     * function to return phone number from token
     * @param param 
     */

    @Post("getInfo")
    async getPhoneNumberFromToken(@Req() reqest: any, @Body() param: UserInfoRequest): Promise<any> {
        const phonenumber: string = await FirebaseMiddleware.getPhoneNumberFromToken(reqest)
        return { message: phonenumber }
    }
    @Get('verifyEmail')
    async verifyEmailAndSendPdf(@Query() query) {
        console.log("inside verify email")
        await this.userService.sendPdf(query.value)
        return "Email containing your personal data is sent to your email."
    }

    /**
     * 
     * @param reqest UserInfoByMailRequestDTO
     * @returns 
     */
    @Post("getUserInfoByMail")
    async getUserDataByMail(@Req() reqest: UserInfoByMailRequestDTO) {
    
        await this.userService.sendVerificationEmail(
            (reqest as any).body.email,
            (reqest as any).body.uid)

        return { code: "200" }
    }

    /**
     * This route is used to create custom token for user, with hUserid
     * @param reqest
     * @param userInfo
     */
    @Post("getUserInfoForUid")
    async getUserInfo(@Req() req: any, @Body() userInfo: UserInfoRequest) {
        let response = this.userService.getUserInformationById(req, userInfo)
            .catch(err => { throw err });
        return { result: await response };
    }
    @Post('signup')
    @UseInterceptors(FileInterceptor('image', {
        storage: diskStorage({
            destination: './files',
            filename: editFileName,
        }),
        fileFilter: imageFileFilter,
        limits: { fileSize: 35000 }
    }))
    async signUp
        (
            @Req() reqest: any,
            @UploadedFile() file: Express.Multer.File,
            @Body() body: SignupBodyDto
        ) {


        const userId = await FirebaseMiddleware.getUserId(reqest)

        const user = await this.userService.signup(body, userId, file)
        return { "result": user };


    }

    @Post('updateUserInfo')
    @UseInterceptors(FileInterceptor('image', {
        storage: diskStorage({
            destination: './files',
            filename: editFileName,
        }),
        fileFilter: imageFileFilter,
        limits: { fileSize: 35000 }
    }))
    async update
        (
            @Req() reqest: any,
            @UploadedFile() file: Express.Multer.File,
            @Body() body: SignupBodyDto
        ) {

        const userId = await FirebaseMiddleware.getUserId(reqest)
        const user = await this.userService.updateUserInfo(body, userId, file)
        return { "result": user };
    }
    // validateRequest(request: any) {
    //    if(request.body.firstName)
    // }
    @Get('test')
    async test() {

    }

}