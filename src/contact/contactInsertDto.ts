import { SpammerStatus } from "./contact.dto";

export class ContactInsertDTO{
    _id:string
    name?: string;
    firstNDigits:string;
    phoneNumber?: string;
    carrier?: string;
    location?: string;
    line_type?: string;
    country?:string;
    spammerStatus:SpammerStatus
}