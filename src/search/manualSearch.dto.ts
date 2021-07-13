import { Type } from "class-transformer";
import { IsString, Length, ValidateNested } from "class-validator";
import { HAccessTokenData } from "src/auth/accessToken.dto";

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

    @ValidateNested()
    @Type(() => HAccessTokenData)
    tokenData:HAccessTokenData


}