import { Type } from "class-transformer";
import { IsString, Length, ValidateNested } from "class-validator";
import { HAccessTokenData } from "src/auth/accessToken.dto";

export class ManualSearchDto{
    // @Length(7, 12)
    @Length(0, 100)
    phoneNumber:string;
    
    @Length(0, 100)
    uid:string;

    @Length(0, 100)
    countryIso:string;

    @Length(0, 100)
    countryCode:string

    @ValidateNested()
    @Type(() => HAccessTokenData)
    tokenData:HAccessTokenData


}