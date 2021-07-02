import { ArrayMaxSize, IsArray } from "class-validator";
import { ReqContactDTO } from './reqContactDTO';

export class ReqBodyDTO {
    @IsArray()
    @ArrayMaxSize(10000)
    contacts: ReqContactDTO[];
}