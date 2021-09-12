import { Type } from "class-transformer";
import { IsString, MaxLength, MinLength, ValidateNested } from "class-validator";
import { HAccessTokenData } from "src/auth/accessToken.dto";

export class NameSuggestionDto {
    @IsString()
    @MinLength(1)
    @MaxLength(100)
    name:string

    @IsString()
    @MinLength(1)
    @MaxLength(100)
    number:string

    @ValidateNested()
    @Type(()=>HAccessTokenData)
    tokenData:HAccessTokenData
}