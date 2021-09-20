import { CurrentlyActiveAvatar } from "src/contactManage/dto/contactDocument";
import { SpamerType } from "src/spam/spam.type";
import {Constants} from "../calls/Constatns";

export class SearchResponseItem {
    firstName:string;
    lastName:string;
    carrier:string;
    location:string
    lineType:string
    country:string
    spamCount:number
    thumbnailImg:string;
    spamerType: number; // todo
    isInfoFoundInDb:number = Constants.INFO_NOT_FOUND_IND_DB
    nameInPhoneBook:string = "";
    hUid: string="";
    email:string = "";
    avatarGoogle:string = "";
    bio:string = "";
    isVerifiedUser:boolean = false


}