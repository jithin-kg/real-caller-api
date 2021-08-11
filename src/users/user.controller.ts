import {
    Body, Controller, Get, Headers, Param, Post, Query, Req, Request, Res, UploadedFile, UseGuards, UseInterceptors
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { time } from "console";
import { Response } from "express";
import { diskStorage } from 'multer';
import { FirebaseMiddleware } from "src/auth/firebase.middleware";
import { AuthGuard } from "src/auth/guard/auth.guard";
import { HAuthGuard } from "src/auth/guard/hAuth.guard";
import { FirebaseUid } from "src/uids.dto";

import { GenericServiceResponseItem } from "src/utils/Generic.ServiceResponseItem";
import { editFileName, imageFileFilter } from './file/file-upload.utils';
import { SignupBodyDto } from "./singupBody";
import { Userservice } from "./user.service";
import { UserDataManageService } from './userDataManage/userDataManage.service';
import { UserDataManageResponseDTO } from './userDataManage/userDataResponseDTO';
import { UserInfoByMailRequestDTO } from "./UserInfoByMailRequestDTO";
import { UserInfoRequest } from "./userinfoRequest.dto";
import { UserInfoResponseDTO } from "./userResponse.dto";
import {HAccessTokenData} from "../auth/accessToken.dto"
import { GetHAuthGuard } from "src/auth/guard/gethAuth.guard";
import { DeactivateDTO } from "./deactivate.dto";

@Controller('user')
export class Usercontroller {
    constructor(private readonly userService: Userservice,
        private userDataManageService: UserDataManageService) { }

    /**
     * function to return phone number from token
     * @param param 
     */

    @UseGuards(AuthGuard)
    @Post("getInfo")
    async getPhoneNumberFromToken(@Headers() header, @Body() param: UserInfoRequest): Promise<any> {
        const phonenumber: string = await FirebaseMiddleware.getPhoneNumberFromToken(header)
        return { message: phonenumber }
    }
    // @UseGuards(AuthGuard)
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

    @UseGuards(HAuthGuard)
    @Post("getUserInfoByMail")
    async getUserDataByMail(@Body() reqest: UserInfoByMailRequestDTO) {

        await this.userService.sendVerificationEmail(
            reqest.email,
            reqest.tokenData.uid)

        return { code: "200" }
    }

    /**
     * This route is used to create custom token for user, with hUserid
     * @param reqest
     * @param userInfo
     */
    @UseGuards(AuthGuard)
    @Post("getUserInfoForUid")
    async getUserInfo(@Headers() header: any, 
        @Body() userInfo: UserInfoRequest, 
        @Res({ passthrough: true }) res: Response
        ): Promise<GenericServiceResponseItem<UserInfoResponseDTO>> {
        console.time("getInfo")
        let response = await this.userService.getUserInformationById(header, userInfo)
        // .catch(err => { throw err });
        res.status(response.statusCode)
        console.timeEnd("getInfo")
        // return { result: await response };
        return response
    }

    @UseGuards(HAuthGuard)
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
            @Body() body: SignupBodyDto,
            @Res({passthrough:true}) res:Response
        ): Promise<GenericServiceResponseItem<UserInfoResponseDTO|null>> {
        console.time("signup")
        const tokenData = await FirebaseMiddleware.getTokenDataFromHeader(reqest)
        const result = await this.userService.signup(body, tokenData, file)
        res.status(res.statusCode)
        console.timeEnd("signup")
        return result
    }
    @UseGuards(HAuthGuard)
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
            @Body() body: SignupBodyDto,
            @Res({passthrough:true}) res:Response
        ) {

        const userId = await FirebaseMiddleware.getUserId(reqest)
        const result = await this.userService.updateUserInfo(body, userId, file)
        res.status(result.statusCode)
        return result
    }
    // validateRequest(request: any) {
    //    if(request.body.firstName)
    // }
    @Get('test')
    async test() {
    }

    @UseGuards(GetHAuthGuard)
    @Get('getMyData')
    async getUserData(@Param() tokenData: HAccessTokenData, @Res({passthrough:true}) res:Response){
        // let userDataInToken = await FirebaseMiddleware.getTokenDataFromHeader(req)
        // let response = await this.userDataManageService.getMyData(userDataInToken);
        // res.status(response.statusCode)
        // console.time("getMyData")
        let response = await this.userDataManageService.getMyData(tokenData);
        // res.status(response.statusCode)
        // console.timeEnd("getMyData")
        // return response;
        return response.data;
        // return {"message":"hi"}
    }
    /**
     * route to deactivate user account 
     * 
     */
    @UseGuards(HAuthGuard)
    @Post('deactivate')
    async deactivate(@Body() body:DeactivateDTO, @Res({passthrough:true}) res:Response ){
       
       const result =  await this.userService.deactivate(body.tokenData)
        res.status(result.statusCode)
        return result
    }

}