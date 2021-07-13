import { IsString } from "class-validator";

export class FirebaseUid {
    @IsString()
    uid:string;
}

export class Uids { 
    @IsString()
    uid:string;

    @IsString()
    huid:string;
}