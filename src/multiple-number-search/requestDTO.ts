import { ArrayMaxSize, IsJSON, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min, MinLength, minLength } from "class-validator";


export class RequestDTO{
   @IsString({each:true})
   @MaxLength(12,{each:true}) // todo set to 64, bit hash length
   @MinLength(3, {each:true})
   @ArrayMaxSize(8000)
   readonly hashedPhoneNum: string[];
   @IsNotEmpty()
   @IsString()
   readonly uid:string
    
}

