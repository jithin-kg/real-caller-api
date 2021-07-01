

export class ContactRehashedItemWithOldHash{
    phoneNumber:string;
    firstName:string;
    lastName:string
    lineType:String;
    location:String;
    carrier:string;
    country:string;
    spamCount:Number;
    isRegistered: boolean = false;
    hUname?: string = "";

    isInfoFoundInDb:Number // to indicate whether the searched number is found in db 0 -> not found 1-> found
    imageThumbnail:String;

}