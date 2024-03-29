import { CurrentlyActiveAvatar } from "./contactDocument";


export class ContactRehashedItemWithOldHash{
    phoneNumber:string = "";
    firstName:string="";
    lastName:string=""
    lineType:String="";
    location:String="";
    carrier:string="";
    country:string="";
    spamCount:Number=0;
    nameInPhoneBook:string="";
    isRegistered: boolean = false;
    hUid:string = "";
    bio:string = ""
    email:string = "";
    avatarGoogle:string = "";

    // hUname?: string = ""
    isInfoFoundInDb:Number // to indicate whether the searched number is found in db 0 -> not found 1-> found
    imageThumbnail:String="";
    isVerifiedUser:boolean = false


}