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
import { SignupBodyDto } from "./dto/singupBody";
import { Userservice } from "./user.service";
import { UserDataManageService } from './userDataManage/userDataManage.service';
import { UserDataManageResponseDTO } from './userDataManage/userDataResponseDTO';
import { UserInfoByMailRequestDTO } from "./dto/UserInfoByMailRequestDTO";
import { UserInfoRequest } from "./dto/userinfoRequest.dto";

import {HAccessTokenData} from "../auth/accessToken.dto"
import { GetHAuthGuard } from "src/auth/guard/gethAuth.guard";
import { DeactivateDTO } from "./dto/deactivate.dto";
import { UpdateProfileBody } from "./updateProfileBody";
import { UserInfoResponseDTO } from "./dto/userResponse.dto";
import { UpdateProfileWithGoogleDTO } from "./dto/updateProfileBodyWithGoogle";
import { SignupWithGoogleDto } from "./dto/signupWithGoogleDto";

@Controller('user')
export class Usercontroller {
    constructor(private readonly userService: Userservice,
        private userDataManageService: UserDataManageService) { }

    /**
     * currently this api is not called from android client
     * function to return phone number from token
     * 
     * @param param 
     */
    // @UseGuards(AuthGuard)
    // @Post("getInfo")
    // async getPhoneNumberFromToken(@Headers() header, @Body() param: UserInfoRequest): Promise<any> {
    //     const phonenumber: string = await FirebaseMiddleware.getPhoneNumberFromToken(header)
    //     return { message: phonenumber }
    // }
    // @UseGuards(AuthGuard)
    // @Get('verifyEmail')
    // async verifyEmailAndSendPdf(@Query() query) {

    //     await this.userService.sendPdf(query.value)
    //     return "Email containing your personal data is sent to your email."
    // }

    /**
     * 
     * @param reqest UserInfoByMailRequestDTO
     * @returns 
     */

    // @UseGuards(HAuthGuard)
    // @Post("getUserInfoByMail")
    // async getUserDataByMail(@Body() reqest: UserInfoByMailRequestDTO) {

    //     await this.userService.sendVerificationEmail(
    //         reqest.email,
    //         reqest.tokenData.uid)

    //     return { code: "200" }
    // }

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
        let response = await this.userService.getUserInformationById(userInfo)
        // .catch(err => { throw err });
        res.status(response.statusCode)

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
        limits: { fileSize: 40971 }
    }))
    async signUp
        (
            @Req() reqest: any,
            @UploadedFile() file: Express.Multer.File,
            @Body() body: SignupBodyDto,
            @Res({passthrough:true}) res:Response
        ): Promise<GenericServiceResponseItem<UserInfoResponseDTO|null>> {
        const tokenData = await FirebaseMiddleware.getTokenDataFromHeader(reqest)
        // fe8c2783e0a8ce63df3a5585b3d463554559a0da9724127907b22a6599bdfed2
        
        const result = await this.userService.signup(body, tokenData, file)
        res.status(res.statusCode)
        return result
    }
    /**
     * profile update with body and image
     * @param reqest 
     * @param file 
     * @param body 
     * @param res 
     * @returns 
     */
    @UseGuards(HAuthGuard)
    @Post('updateUserInfo')
    @UseInterceptors(FileInterceptor('image', {
        storage: diskStorage({
            destination: './files',
            filename: editFileName,
        }),
        fileFilter: imageFileFilter,
        limits: { fileSize: 40971 }
    }))
    async update
        (
            @Req() reqest: any,
            @UploadedFile() file: Express.Multer.File,
            @Body() body: UpdateProfileBody,
            @Res({passthrough:true}) res:Response
        ) {
        //unable to add token data to post body in multipart, so this is needed here    
        const userId = await FirebaseMiddleware.getUserId(reqest)
        const result = await this.userService.updateUserInfo(body, userId, file)
        res.status(result.statusCode)
        return result
    }

    /**
     * update user profile with profile image received from google auth
     * and other details such as email and first and last name may be from 
     * google 
     */
    @UseGuards(HAuthGuard)
    @Post("updateProfile")
    async updateProfileWithGoogle(@Body() body:UpdateProfileWithGoogleDTO, @Res({passthrough:true}) res:Response){
        const result = await this.userService.updateProfileWithgoogle(body)
        res.status(result.statusCode)
        return result;
    }
    // Error while removeUserPhoneNumberFromFirebase Error: Error while making request: timeout of 25000ms exceeded.

    /**
     * user complated profile with google auth
     */
     @UseGuards(HAuthGuard)
     @Post("signupWithGoogle")
     async signupWithGoogle(@Body() body:SignupWithGoogleDto, @Res({passthrough:true}) res:Response){
         const result = await this.userService.signupWithGoogle(body)
         res.status(result.statusCode)
         return result;
     }

    // validateRequest(request: any) {
    //    if(request.body.firstName)
    // }
    

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
    //    const result =  await this.userService.removeOrUpdateContact(body.tokenData)
        res.status(result.statusCode)
        return result
    }

    

}