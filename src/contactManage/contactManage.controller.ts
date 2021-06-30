import { Body, Controller, Post } from '@nestjs/common';
import { ContactManageService } from './contactManage.service';
import { ContactSyncDTO } from './contactsycnDTO';
@Controller('contacts')
export class ContactManageController {
    constructor(private readonly ContactManageService: ContactManageService) { }

    @Post("uploadcontacts")
    async uploadContacts(@Body() contactsDTO: ContactSyncDTO) {
        console.log('%c inside post req uploadcontacts','color:yellow')
        let res = await this.ContactManageService.uploadBulkContacts(contactsDTO.contacts, contactsDTO.countryCode, contactsDTO.countryISO)
        console.log({res});
        return { contacts: res }
    }

}