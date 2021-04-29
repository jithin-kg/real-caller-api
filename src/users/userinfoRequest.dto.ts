import { IsString } from "class-validator";

export class UserInfoRequest{
   @IsString()
    uid: String;
}