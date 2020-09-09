import { IsString, IsEmail } from "class-validator";

export class UserDto {
    @IsString()
    firstName: string;
    @IsEmail()
    email: string;
    @IsString()
    accountType: string;
    @IsString()
    uid:String;
}