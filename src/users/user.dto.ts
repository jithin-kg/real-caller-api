import { IsEmail, Allow, IsString }  from 'class-validator'



export class UserDto {
    

    // @IsString()
    // email: string;
    _id:string;

    @IsString()
    firstName : string;
    
    @IsString({})
    gender?:string

    @IsString()
    lastName:string;
    
    @IsString()
    phoneNumber?:string;
    
    @IsString()
    uid?:string;
    
    image?:Buffer

    
}