import { Type } from "class-transformer";
import { ArrayMaxSize, IsArray, IsString, Length, MaxLength, MinLength, ValidateNested } from "class-validator";
import { HAccessTokenData } from "src/auth/accessToken.dto";

export class SpamDTO{
    // @Length(7, 12)
    @IsArray()
    phoneNumbers:string[];
    
    @IsString()
    country:String;

    @IsString()
    spammerType:string;
    
    @ValidateNested()
    @Type(() => HAccessTokenData)
    tokenData:HAccessTokenData
}
export class UserSpamReportRecord{
    phoneNumber:string;
    
    country:String;

    spammerType:string;
    
    uid?:string;

    hUid?:string
    tokenData:HAccessTokenData
}


