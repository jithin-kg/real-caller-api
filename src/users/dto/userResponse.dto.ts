import { IsString } from "class-validator";

export class UserInfoResponseDTO {
    @IsString()
    firstName : string = "";

    @IsString()
    lastName:string = "";
    
    image? : string =""
    @IsString()
    customToken:string = ""

    // @IsString()
    // phoneNumber:string;

    //todo remove this in production
    isBlockedByAdmin:number = 0;

    isPhoneNumRemovedInFireBs:Boolean = false
}