import { IsEmail, Allow, IsString }  from 'class-validator'

export class UserDto extends Map {
    _id?:any;
    @IsString()
    firstName?: string;
    @IsEmail()
    email?: string;
    @IsString()
    accountType?: string;
    @IsString()
    uid?:string;
}