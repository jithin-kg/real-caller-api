import { Type } from "class-transformer";
import {IsNumber, isString, IsString, Length, ValidateNested} from "class-validator";
import { BasicAccessTokenData, HAccessTokenData } from "src/auth/accessToken.dto";

export class SignupBodyDto {


    @Length(1, 100)
    firstName: string

    @Length(1, 100)
    lastName: string

    @Length(5, 100)
    hashedNum: string;

    @Length(5, 100)
    phoneNumber: string;

    @Length(0, 10)
    countryCode :string

    @Length(0, 10)
    countryISO: string
}