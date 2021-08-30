import { SpamerType } from "src/spam/spam.type";

export class ContactDocument {
    _id:string = "";
    firstName: string = "";
    lastName: String = "";
    carrier: string = "";
    location: string = "";
    lineType: string = "";
    country:string = "";
    spamCount:number = 0
    image:String = "";
    spamerType: SpamerType;
    // if hUid is not null the phone number is registered users phone number or the document contains  
    //a registered user details
    hUid: string="";
}

