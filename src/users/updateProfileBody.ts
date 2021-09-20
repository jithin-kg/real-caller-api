import { Type } from "class-transformer";
import {IsNumber, isString, IsString, ValidateNested} from "class-validator";
import { BasicAccessTokenData, HAccessTokenData } from "src/auth/accessToken.dto";

export class UpdateProfileBody {
    @IsString()
    firstName: string

    @IsString()
    lastName: string

    @IsString()
    email:string;

    @IsString()
    bio:string;

    @IsString()
    hashedNum: string;

    @IsString()
    phoneNumber: string;

    @IsString()
    countryCode :string

    @IsString()
    countryISO: string;
    


    



}