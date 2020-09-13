import { IsEmail, Allow, IsString }  from 'class-validator'

export class UserDto extends Map {
    @IsString()
    firstName?: string;
    @IsEmail()
    email?: string;
    @IsString()
    accountType?: string;
    @IsString()
    uid?:string;
}