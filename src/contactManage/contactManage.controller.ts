import { Body, Controller, Post, Req } from '@nestjs/common';
import { ContactManageService } from './contactManage.service';
import { ContactSyncDTO } from './contactsycnDTO';
import { ReqBodyDTO } from './myContacts/reqBodyDTO';
@Controller('contacts')
export class ContactManageController {
    constructor(private readonly ContactManageService: ContactManageService) { }

    @Post("uploadcontacts")
    async uploadContacts(@Body() contactsDTO: ContactSyncDTO) {
        console.log('%c inside post req uploadcontacts', 'color:yellow')
        let res = await this.ContactManageService.uploadBulkContacts(contactsDTO.contacts, contactsDTO.countryCode, contactsDTO.countryISO)
        console.log({ res });
        return { contacts: res }
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