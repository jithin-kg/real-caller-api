import { CurrentlyActiveAvatar } from "src/contactManage/dto/contactDocument";

export class UserDoc  {
    _id:string;
    hUid:string;
    firstName?: string;
    lastName:string;
    email?: string;
    bio:String = "";
    avatarGoogle:String = "";
    accountType?: string;
    uid?: string;
    image? : Buffer;
    isBlockedByAdmin:Boolean = false;
    currentlyActiveAvatar:number = CurrentlyActiveAvatar.NONE;
    isVerifiedUser:boolean = false;

}
