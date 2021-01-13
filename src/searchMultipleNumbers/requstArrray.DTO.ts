import { IsArray, IsNotEmpty } from "class-validator";


export class RequestArrayDTO{
    @IsArray()
    hashedPhoneNumber:string
    @IsNotEmpty()
    uid:string
}