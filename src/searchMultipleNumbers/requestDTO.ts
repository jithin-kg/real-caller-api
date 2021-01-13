import { IsNotEmpty, IsOptional } from "class-validator";
import { RequestArrayDTO } from "./requstArrray.DTO";

export class RequestDTO{
 @IsOptional()
    readonly hashedPhoneNum: string[];
    @IsNotEmpty()
     readonly uid:string
    
}

