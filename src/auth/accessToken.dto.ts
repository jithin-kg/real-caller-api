import { IsString } from "class-validator";
/**
 * For routes without users having huid
 */
export class BasicAccessTokenData {
    @IsString()
    uid:string;
    
 }
/**
 * For routes with users having huid
 */
export class HAccessTokenData {
    @IsString()
    uid:string;
 
    @IsString()
    huid:string;
 
 }