import {IsString} from "class-validator";

export class UidOnlyRequest{
    @IsString()
    uid:String;
}