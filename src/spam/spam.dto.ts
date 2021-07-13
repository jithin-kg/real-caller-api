import { Type } from "class-transformer";
import { IsString, Length, MaxLength, MinLength, ValidateNested } from "class-validator";
import { HAccessTokenData } from "src/auth/accessToken.dto";

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
    @ValidateNested()
    @Type(() => HAccessTokenData)
    tokenData:HAccessTokenData
}