import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ContactManageService } from './contactManage.service';
import { ContactSyncDTO } from './dto/contactsycnDTO';
import { ReqBodyDTO } from './myContacts/reqBodyDTO';
import {Response} from "express";
import { GenericServiceResponseItem } from 'src/utils/Generic.ServiceResponseItem';
import { ContactRehashedItemWithOldHash } from './dto/contactRehashedItemwithOldHash';
import { HAuthGuard } from 'src/auth/guard/hAuth.guard';


@Controller('contacts')
@UseGuards(HAuthGuard)
export class ContactManageController {
    constructor(private readonly contactManageService: ContactManageService) { }
    
    @Post("uploadcontacts")
    async uploadContacts(@Body() contactsDTO: ContactSyncDTO, @Res({passthrough:true}) res:Response):Promise<GenericServiceResponseItem<ContactRehashedItemWithOldHash[]>> {
        console.time()
        let result = await this.contactManageService.uploadBulkContacts(
            contactsDTO.contacts,
             contactsDTO.countryCode,
              contactsDTO.countryISO,
              contactsDTO.tokenData
              )
        res.status(result.statusCode)
        // return { contacts: res }
        console.timeEnd()

        return result;
    }
    @Post("savecontacts")
    async saveContactsToMyContacts(@Body() ReqBody: ReqBodyDTO, @Req() _req: any, @Res({passthrough:true}) res:Response) {
        let response = { message: 0 };
        const result = await this.contactManageService.saveMyContacts(ReqBody, _req)
        res.status(result.statusCode) 
         return {message:res.statusCode}
    }
}