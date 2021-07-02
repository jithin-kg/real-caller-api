import { ArrayMaxSize, IsArray, IsString, MaxLength } from "class-validator";
import { ReqContactDTO } from './reqContactDTO';

export class ReqBodyDTO {
    @IsArray()
    @ArrayMaxSize(10000)
    contacts: ReqContactDTO[];

    @IsString()
    @MaxLength(30)
    uid: string;
}