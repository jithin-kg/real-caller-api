import { ArrayMaxSize, IsJSON, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min, MinLength, minLength } from "class-validator";


export class RequestDTO{
   @IsString({each:true})
   @MaxLength(100,{each:true}) // todo set to 64, bit hash length
   @MinLength(3, {each:true})
   @ArrayMaxSize(3780)
   readonly hashedPhoneNum: string[];
   @IsNotEmpty()
   @IsString()
   readonly uid:string
    
}

