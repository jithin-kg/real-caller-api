import { IsBoolean, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class ContactReturnDto  {
     
    public test(){

    }
    @IsString()
    hashOne:string //old hash recieved from client
    @IsNotEmpty()
    name?: string;
    @IsNotEmpty()
    @IsNumber()
    hashTwo?: string; // hash after adding secret
    @IsString()
    carrier?: string;
    @IsString()
    location?: string;
    @IsString()
    line_type?: string;
    @IsString()
    country?:string;
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