

export class RehashedItemWithOldHash{
    phoneNumber:string;
    newHash:string;
    firstName:string;
    lastName:string
    spamCount:Number;
    lineType:String;
    location:String;
    isInfoFoundInDb:Number // to indicate whether the searched number is found in db 0 -> not found 1-> found
    
}