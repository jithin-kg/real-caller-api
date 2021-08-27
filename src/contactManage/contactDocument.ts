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
    image:String = ""
    spamerType: SpamerType
}

