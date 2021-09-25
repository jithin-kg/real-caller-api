import { Type } from "class-transformer";
import { IsString, Length, MaxLength, MinLength, ValidateNested } from "class-validator";
import { HAccessTokenData } from "src/auth/accessToken.dto";

export class NameSuggestionDto {
    @Length(1, 100)
    name:string

    @Length(1, 100)
    number:string

    @ValidateNested()
    @Type(()=>HAccessTokenData)
    tokenData:HAccessTokenData
}