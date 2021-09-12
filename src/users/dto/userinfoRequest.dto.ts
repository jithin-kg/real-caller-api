import { Type } from "class-transformer";
import { IsString, ValidateNested } from "class-validator";
import { BasicAccessTokenData } from "src/auth/accessToken.dto";




export class UserInfoRequest {
   @IsString()
   hashedNum:string;
   @IsString()
   formattedPhoneNum:string
   @ValidateNested()
   @Type(()=>BasicAccessTokenData)
   tokenData:BasicAccessTokenData
}

