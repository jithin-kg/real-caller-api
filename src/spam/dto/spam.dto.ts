import { Type } from "class-transformer";
import { ArrayMaxSize, IsArray, IsString, Length, MaxLength, MinLength, ValidateNested } from "class-validator";
import { HAccessTokenData } from "src/auth/accessToken.dto";

export class SpamDTO{
    // @Length(7, 12)
    @IsArray()
    @MaxLength(100, {
        each:true
    })
    phoneNumbers:string[];
    
    @Length(0, 10)
    country:String;

    @Length(0, 10)
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


