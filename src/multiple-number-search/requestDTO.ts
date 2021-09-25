import { Type } from "class-transformer";
import { ArrayMaxSize, IsJSON, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min, MinLength, minLength, ValidateNested } from "class-validator";
import { HAccessTokenData } from "src/auth/accessToken.dto";

import {ContactAdderssWithHashedNumber} from './contactAddressWithHashedNumDTO'

export class RequestDTO{
   // @IsString({each:true})
   // @MaxLength(100,{each:true}) // todo set to 64, bit hash length
   // @MinLength(3, {each:true})
   @ArrayMaxSize(15)
   @ValidateNested({each:true})
   @Type(() => ContactAdderssWithHashedNumber)
   readonly hashedPhoneNum: ContactAdderssWithHashedNumber[];
   

   @ValidateNested()
   @Type(() => HAccessTokenData)
   tokenData:HAccessTokenData

    
}

