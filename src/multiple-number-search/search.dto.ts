import { IsNotEmpty, IsString } from "class-validator";

export class SearchDTO{
    @IsString()
    @IsNotEmpty()
    name:string
    @IsString()
    uid:string
}