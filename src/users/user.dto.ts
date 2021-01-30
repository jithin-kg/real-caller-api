import { IsEmail, Allow, IsString }  from 'class-validator'


email:'am@gmail.com'
firstName:'amshs'
gender:'32'
lastName:'ejrj'
phoneNumber:'912'
uid:'dGAOxDY8V9M4thGMFn65ORcyzaw1'

export class UserDto {
    

    @IsString()
    email: string;
    
    @IsString()
    firstName : string;

    @IsString()
    gender:string

    @IsString()
    lastName:string;
    
    @IsString()
    phoneNumber:string;
    
    @IsString()
    uid?:string;

    
}