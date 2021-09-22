import { SpamerType } from "src/spam/dto/spam.type";

export class ContactDocument {
    _id:string = "";
    firstName: string = "";
    lastName: string = "";
    carrier: string = "";
    location: string = "";
    lineType: string = "";
    country:string = "";
    spamCount:number = 0
    image:string = "";
    spamerType: SpamerType;
    nameInPhoneBook:string = "";
    // if hUid is not null the phone number is registered users phone number or the document contains  
    //a registered user details
    hUid: string="";
    bio:string = "";
    email:string = "";
    avatarGoogle:string = "";
    isVerifiedUser:boolean = false
    
}

export enum CurrentlyActiveAvatar {
    NONE = 0, // no profile image avaialble
    GOOGLE = 1, // avatar image from googel login
    OTHER = 2 // user uploaded image 
}

export class UserUploadedContacts { 
    _id:string;
    rehasehdNums:string[]
}
