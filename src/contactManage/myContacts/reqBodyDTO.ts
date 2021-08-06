import { each } from "async";
import { Type } from "class-transformer";
import { ArrayMaxSize, IsArray, IsString, Length, MaxLength, MinLength, ValidateNested } from "class-validator";
import { HAccessTokenData } from "src/auth/accessToken.dto";
import { ReqContactDTO } from './reqContactDTO';

export class ReqBodyDTO {
    @IsArray()
    @ArrayMaxSize(1000)
    @ValidateNested({each:true}) // for validating nested object
    @Type(()=>ReqContactDTO)   // validatin array of Objects
    contacts: ReqContactDTO[];

    // @IsString()
    // @MaxLength(40)
    // @MinLength(20)
    // uid: string;

    @ValidateNested()
    @Type(() => HAccessTokenData)
    tokenData:HAccessTokenData
}