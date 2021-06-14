import { IsString, Length } from "class-validator";

export class ManualSearchDto{
    // @Length(7, 12)
    @IsString()
    phoneNumber:string;
    @IsString()
    uid:string;

    @IsString()
    countryIso:string;

    @IsString()
    countryCode:string

}