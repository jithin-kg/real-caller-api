import { IsString } from "class-validator";

export class UserInfoRequest{
   @IsString()
    uid: string;

   @IsString()
   hashedNum:string;

   @IsString()
   formattedPhoneNum:string
}