import { IsEmpty, IsString, Length } from "class-validator";

export class ContactAdderssWithHashedNumber{
    @IsEmpty()
    contactAddressString:string;

    @Length(10, 150)
    contactAddressHashed:string;
}