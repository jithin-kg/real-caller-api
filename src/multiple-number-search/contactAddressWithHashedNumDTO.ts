import { IsString } from "class-validator";

export class ContactAdderssWithHashedNumber{
    @IsString()
    contactAddressString:string;

    @IsString()
    contactAddressHashed:string;
}