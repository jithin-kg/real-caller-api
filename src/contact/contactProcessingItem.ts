/**
 * this class instance cannot be inserted into database
 * because this contains actual phone number
 */
export class ContactProcessingItem {
    hashedPhoneNumber:string = ""
    prevHash:string = "";
    carrier: string = "";
    location: string = "";
    lineType: string = "";
    country:string = "";
    spamCount:number 
    firstName:string = "";
    lastName: string = "";
    image:string = ""
}