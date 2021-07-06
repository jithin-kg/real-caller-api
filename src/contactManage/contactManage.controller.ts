import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { ContactManageService } from './contactManage.service';
import { ContactSyncDTO } from './contactsycnDTO';
import { ReqBodyDTO } from './myContacts/reqBodyDTO';
import {Response} from "express";
import { GenericServiceResponseItem } from 'src/utils/Generic.ServiceResponseItem';
import { ContactRehashedItemWithOldHash } from './contactRehashedItemwithOldHash';
@Controller('contacts')
export class ContactManageController {
    constructor(private readonly ContactManageService: ContactManageService) { }

    @Post("uploadcontacts")
    async uploadContacts(@Body() contactsDTO: ContactSyncDTO, @Res({passthrough:true}) res:Response):Promise<GenericServiceResponseItem<ContactRehashedItemWithOldHash[]>> {
        console.log('%c inside post req uploadcontacts', 'color:yellow')
        let result = await this.ContactManageService.uploadBulkContacts(contactsDTO.contacts, contactsDTO.countryCode, contactsDTO.countryISO)
        res.status(result.statusCode)
        // return { contacts: res }
        return result;
    }
    @Post("savecontacts")
    async saveContactsToMyContacts(@Body() ReqBody: ReqBodyDTO, @Req() _req: any) {
        let response = { message: 0 };
        await this.ContactManageService.saveMyContacts(ReqBody, _req)
            .then(res => {
                response.message = 1;
                return response
            })
            .catch(err => {
                console.log(err);
                return response
            })
    }
}