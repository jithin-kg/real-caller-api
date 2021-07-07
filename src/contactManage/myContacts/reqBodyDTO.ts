import { each } from "async";
import { Type } from "class-transformer";
import { ArrayMaxSize, IsArray, IsString, Length, MaxLength, ValidateNested } from "class-validator";
import { ReqContactDTO } from './reqContactDTO';

export class ReqBodyDTO {
    @IsArray()
    @Length(1, 10000)
    @ValidateNested({each:true}) // for validating nested object
    @Type(()=>ReqContactDTO)   // validatin array of Objects
    contacts: ReqContactDTO[];

    @IsString()
    @Length(28, 28)
    uid: string;
}