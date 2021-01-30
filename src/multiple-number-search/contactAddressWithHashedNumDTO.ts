import { IsString } from "class-validator";

export class ContactAdderssWithHashedNumber{
    @IsString()
    contactAddersString:string;

    @IsString()
    contactAddressHashed:string;
}