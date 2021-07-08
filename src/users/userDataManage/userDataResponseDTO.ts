import { IsArray, IsString } from 'class-validator';
import { ReqContactDTO } from './../../contactManage/myContacts/reqContactDTO';
export class UserDataManageResponseDTO {
    //userinformations
    @IsString()
    firstName: string = "";
    @IsString()
    lastName: string = "";
    image?: string = "";
    //--------------------------
    //saved contacts
    @IsArray()
    contacts: ReqContactDTO[]
}