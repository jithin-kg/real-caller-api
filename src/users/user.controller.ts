import {
    Body, Controller, Get, HttpException,
    HttpStatus, Post, Query, Req, UploadedFile, UseInterceptors
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from 'multer';
import { FirebaseMiddleware } from "src/auth/firebase.middleware";
import { editFileName, imageFileFilter } from './file/file-upload.utils';
import { Formatter } from "./Formatter";
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
    async getUserInfo(@Req() reqest: any, @Body() userInfo: UserInfoRequest) {
        console.time("getUserInfo");
        console.log("inside getUserInfoForUid")
        let user;
        const id = userInfo.uid;
        const phoneNumInToken: string = await FirebaseMiddleware.getPhoneNumberFromToken(reqest)
        const formatedNum = Formatter.getFormatedPhoneNumber(phoneNumInToken)
        const formatedNumInRequestBody = Formatter.getFormatedPhoneNumber(userInfo.formattedPhoneNum);
        if (formatedNum == formatedNumInRequestBody) {
            const _parallelProcessFunctions = {
                f: (callback) => {
                    this.userService.getUserInfoByid(id, userInfo.hashedNum).then(res => {
                        callback(null, res);
                    })
                },
                s: (callback) => {
                    FirebaseMiddleware.removeUserPhoneNumberFromFirebase(id)
                        .then(res => callback(null, res))
                        .catch(err => callback(err, err))
                }
            };
            console.log(`returning user-before parallel process`, user)
            const results = await this.userService.doParallelProcess(_parallelProcessFunctions);
            if (results && results['f']) user = results['f'];
            if (user.isBlockedByAdmin) {
                console.log('user  blocked by admin')
                throw new HttpException("Bad request", HttpStatus.FORBIDDEN)
            } else {
                console.log('user not blocked by admin')
            }
            console.timeEnd("getUserInfo")
            console.log(`returning user`, user)
            return { result: user }
        } else {
            throw new HttpException("Bad request", 400)
        }
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