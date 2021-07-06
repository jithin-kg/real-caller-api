import { IsString, Length, MaxLength, MinLength } from "class-validator";

export class SearchDTO{

    @Length(64, 64)
    @IsString()
    
    phoneNumber:string;
    @IsString()
    @Length(28,28)
    uid:string;

}