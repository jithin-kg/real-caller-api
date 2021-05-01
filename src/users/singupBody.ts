import {IsNumber, isString, IsString} from "class-validator";

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