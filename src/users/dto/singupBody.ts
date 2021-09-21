import { Type } from "class-transformer";
import {IsNumber, isString, IsString, ValidateNested} from "class-validator";
import { BasicAccessTokenData, HAccessTokenData } from "src/auth/accessToken.dto";

export class SignupBodyDto {


    @IsString()
    firstName: string

    @IsString()
    lastName: string
    @IsString()
    hashedNum: string;

    @IsString()
    phoneNumber: string;

    @IsString()
    countryCode :string

    @IsString()
    countryISO: string

    



}