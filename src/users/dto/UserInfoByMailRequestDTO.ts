import { Type } from "class-transformer";
import { IsEmail, IsString, Length, ValidateNested } from "class-validator";
import { BasicAccessTokenData, HAccessTokenData } from "src/auth/accessToken.dto";

export class UserInfoByMailRequestDTO {
    @IsEmail()
    email:string;
    @ValidateNested()
   @Type(()=>HAccessTokenData)
   tokenData:HAccessTokenData
    // @IsString()
    // // @Length(28,28)
    // uid: string;
}