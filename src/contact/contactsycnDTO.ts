import { ArrayMaxSize, IsArray, IsNumber, IsString, Max, MaxLength } from "class-validator";
import { ContactDto } from "./contact.dto";
import { ContactRequestDTO } from "./contactRequestDTO";

export class ContactSyncDTO{
    @IsArray()
    @ArrayMaxSize(10000)
     contacts: ContactRequestDTO[];
     
     @IsString()
     @MaxLength(20)
     countryCode: number;

     @IsString()
     countryISO:string

     @IsString()
     @MaxLength(30)
     uid:string;

}