import { IsString, Length } from "class-validator";

export class SearchDTO{
    // @Length(7, 12)
    @IsString()
    phoneNumber:string;
   
    @IsString()
    uid:string;

}