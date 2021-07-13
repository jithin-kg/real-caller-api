import { IsString } from "class-validator";

export class BasicAccessTokenData {
    @IsString()
    uid:string;
    
 }

export class HAccessTokenData {
    @IsString()
    uid:string;
 
    @IsString()
    huid:string;
 
 }