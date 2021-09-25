import { Type } from "class-transformer";
import {IsNumber, isString, IsString, Length, ValidateNested} from "class-validator";
import { BasicAccessTokenData, HAccessTokenData } from "src/auth/accessToken.dto";

export class UpdateProfileBody {
    @Length(1, 100)
    firstName: string

    @Length(1, 100)
    lastName: string

    @Length(0, 100)
    email:string;

    @Length(0, 300)
    bio:string;

    @Length(20, 100)
    hashedNum: string;

    @Length(0, 100)
    phoneNumber: string;

    @Length(0, 10)
    countryCode :string

    @Length(0, 10)
    countryISO: string;

    @Length(0, 100)
    gFName: string;

    @Length(0, 100)
    gLName: string;
    
    @Length(0, 150)
    gEmail: string;
    


    



}