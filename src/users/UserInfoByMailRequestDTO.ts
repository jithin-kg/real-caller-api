import { IsEmail, IsString, Length } from "class-validator";

export class UserInfoByMailRequestDTO {
    @IsEmail()
    email:string;
    
    @IsString()
    @Length(28,28)
    uid: string;
}