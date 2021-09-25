import { Type } from "class-transformer";
import { IsString, Length, ValidateNested } from "class-validator";
import { BasicAccessTokenData, TokenDataWithPhoneNumber } from "src/auth/accessToken.dto";




export class UserInfoRequest {
   @Length(40, 100)
   hashedNum:string;

   @Length(3,100 )
   formattedPhoneNum:string
   
   @ValidateNested()
   @Type(()=>TokenDataWithPhoneNumber)
   tokenData:TokenDataWithPhoneNumber
}

