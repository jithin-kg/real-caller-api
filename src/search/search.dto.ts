import { Type } from "class-transformer";
import { IsString, Length, MaxLength, MinLength, Validate, ValidateNested } from "class-validator";
import { HAccessTokenData } from "src/auth/accessToken.dto";

export class SearchDTO{

    @Length(64, 64)
    @IsString()
    phoneNumber:string;

    @ValidateNested()
    @Type(() => HAccessTokenData)
    tokenData:HAccessTokenData

}