import { Constants } from "src/calls/Constatns";


export class RehashedItemWithOldHash{
    phoneNumber:string ="";
    newHash:string="";
    firstName:string="";
    lastName:string="";
    nameInPhoneBook:string="";
    spamCount:Number =0;
    lineType:String="";
    location:String="";
    isInfoFoundInDb:Number = Constants.INFO_NOT_FOUND_IND_DB // to indicate whether the searched number is found in db 0 -> not found 1-> found
    imageThumbnail:String="";
    carrier:string="";
    country:string="";
    hUid: string = "";
    bio:string = "";
    email:string = "";
    avatarGoogle:string = "";
    isVerifiedUser:boolean = false


}