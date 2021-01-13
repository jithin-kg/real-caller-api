import { IsString, Length, MaxLength, MinLength } from "class-validator";

export class OperatorInfoDTO{
    @IsString()
   @MinLength(2, {message:"Bad request"})
   @MaxLength(30 , {message:"Bad request"})
    operatorName:String;
    @IsString()
    @MinLength(2, {message:"Bad request"})
   @MaxLength(30 , {message:"Bad request"})
    coutryIso?:string
    @IsString()
    uid?:string
}