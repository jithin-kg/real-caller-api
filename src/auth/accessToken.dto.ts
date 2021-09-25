import { IsString, Length } from "class-validator";
/**
 * For routes without users having huid
 */
export class BasicAccessTokenData {
    @IsString()
    uid:string;
 }

 /**
  * this is used when 
  * user/getUserInfoForUid route called, at this point 
  * user token will have phone number in it
  */
 export class TokenDataWithPhoneNumber {
    @Length(3,100 )
    uid:string;

    @Length(3,100 )
    phoneNumber:string
 }
/**
 * For routes with users having huid
 */
export class HAccessTokenData {
    @Length(1, 100)
    uid:string;

    @Length(1, 100)
    huid:string;
 
 }