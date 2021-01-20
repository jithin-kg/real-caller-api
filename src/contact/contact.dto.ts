import { IsBoolean, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class ContactDto  {
     
    public test(){

    }
    @IsNotEmpty()
    name?: string;
    @IsNotEmpty()
    @IsNumber()
    phoneNumber?: string;
    @IsString()
    carrier?: string;
    @IsString()
    location?: string;
    @IsString()
    line_type?: string;
    @IsString()
    country?:string;
    //the first five digits is used to identify a number geographical information
    @IsString()
    firstNDigits:string

    spammerStatus:SpammerStatus
}

//todo make interface to class,because there is no interfaces in js
export interface SpammerStatus extends Void{
   
    spammer?:boolean;

    spamCount?: number;

}

interface Void{
    hasOwnProperty: void
}