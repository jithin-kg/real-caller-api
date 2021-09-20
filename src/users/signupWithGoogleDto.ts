import { Type } from "class-transformer";
import {IsEmail, IsNumber, isString, IsString, Length, ValidateNested} from "class-validator";
import { BasicAccessTokenData, HAccessTokenData } from "src/auth/accessToken.dto";

export class SignupWithGoogleDto {
    
    @Length(1, 40)
    @IsString()
    firstName: string

    @Length(1, 40)
    @IsString()
    lastName: string

    @IsEmail()
    email:string;

    @IsString()
    @Length(0, 200)
    bio:string;

    @IsString()
    @Length(0, 10000)
    avatarGoogle:string;

    @IsString()
    @Length(1, 10000)
    hashedNum:string


    @ValidateNested()
    @Type(()=> HAccessTokenData)
    tokenData:HAccessTokenData
    


    



}