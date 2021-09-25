import { Type } from "class-transformer";
import { ArrayMaxSize, IsArray, IsString, Length, MaxLength, ValidateNested } from "class-validator";
import { HAccessTokenData } from "src/auth/accessToken.dto";
import { ContactRequestDTO } from "../contactRequestDTO";

export class ContactSyncDTO{
    @IsArray()
    @ArrayMaxSize(12)
    @ValidateNested({each:true})
    @Type(() => ContactRequestDTO)
     contacts: ContactRequestDTO[];
     
     @Length(0,5)
     countryCode: string;

     @Length(0,5)
     countryISO:string

    //  @IsString()
    //  @Length(28, 28)
    //  uid:string;

     @ValidateNested()
     @Type(() => HAccessTokenData)
     tokenData:HAccessTokenData



}