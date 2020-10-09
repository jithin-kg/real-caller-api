import { IsNotEmpty, IsNumber } from "class-validator";

export class ContactDto {
    @IsNotEmpty()
    name?: string;
    @IsNotEmpty()
    @IsNumber()
    phoneNumber?: string;
    carrier?: string;
    location?: string;
    line_type?: string;
    country?:string
}