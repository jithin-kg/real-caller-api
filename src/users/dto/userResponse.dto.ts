import { IsString } from "class-validator";

export class UserInfoResponseDTO {
    firstName : string = "";
    lastName:string = "";
    email:string= "";
    bio:String = "";
    avatarGoogle:String = "";
    isVerifiedUser:boolean = false;
    image? : string =""
    isBlockedByAdmin:number = 0;
    isPhoneNumRemovedInFireBs:Boolean = false
    customToken:string = ""
}