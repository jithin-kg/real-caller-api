/**
 * this class instance cannot be inserted into database
 * because this contains actual phone number
 */
export class ContactProcessingItem {
    hashedPhoneNumber:string = ""
    phoneNumber:string = "";
    carrier: string = "";
    location: string = "";
    lineType: string = "";
    country:string = "";
    spamCount:number = 0
    name:string = "";
}