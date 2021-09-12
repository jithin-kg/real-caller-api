import { IsBoolean, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class ContactNewDoc  {
     
    public test(){
    }
    _id:string;
    firstName?: string;
    lastName: string;
    nameInPhoneBook:string;
    phoneNumber?: string;
    carrier?: string;
    location?: string;
    line_type?: string;
    country?:string;
    spamCount:Number
    image?:string
    huid?:string
}

//todo make interface to class,because there is no interfaces in js
export interface SpammerStatus extends Void{
   
    spammer?:boolean;

    spamCount?: number;

}

interface Void{
    hasOwnProperty: void
}