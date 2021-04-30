import { IsString } from "class-validator";

export class UserInfoResponseDTO {
    // @IsString()
    // email: string;
    
    @IsString()
    firstName : string;

    // @IsString()
    // gender:string

    @IsString()
    lastName:string;
    
    image? : string
    // @IsString()
    // phoneNumber:string;    
}