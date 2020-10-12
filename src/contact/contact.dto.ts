import { IsBoolean, IsNotEmpty, IsNumber } from "class-validator";

export class ContactDto  {
     
    public test(){

    }
    @IsNotEmpty()
    name?: string;
    @IsNotEmpty()
    @IsNumber()
    phoneNumber?: string;
    carrier?: string;
    location?: string;
    line_type?: string;
    country?:string;
    spammerStatus:SpammerStatus
}

export interface SpammerStatus extends Void{
   
    spammer?:boolean;
    
    spamCount?: number;

}

interface Void{
    hasOwnProperty: void
}