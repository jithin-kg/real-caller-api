import { IsString, Length, MaxLength, MinLength } from "class-validator";

export class SpamDTO{
    // @Length(7, 12)
    @IsString()
    phoneNumber:string;
    
    @IsString()
    country:String;

    @IsString()
    spammerType:string;
    
    @IsString()
    uid?:string;

    hUid?:string
}