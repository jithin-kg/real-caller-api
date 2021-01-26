import { IsString, Length, MaxLength, MinLength } from "class-validator";

export class SpamDTO{
    // @Length(7, 12)
    @IsString()
    phoneNumber:string;
    @IsString()
    location:String;

    @IsString()
    spammerType:string;

    @IsString()
    spammerCategory:string;

    @IsString()
    uid?:string
}