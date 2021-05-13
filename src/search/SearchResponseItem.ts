import {Constants} from "../calls/Constatns";

export class SearchResponseItem {
    firstName:string;
    lastName:string;
    carrier:string;
    location:string
    lineType:string
    country:string
    spamCount:number
    thumbnailImg:string
    isInfoFoundInDb:number = Constants.INFO_NOT_FOUND_IND_DB
}