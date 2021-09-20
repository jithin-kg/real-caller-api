import { Body, Controller, Post } from '@nestjs/common';
import { RequestDTO } from 'src/multiple-number-search/requestDTO';
import { MultipleNumberSearchService } from './multiple-number-search.service';
import { RehashedItemWithOldHash } from './RehashedItemwithOldHash';

@Controller('multipleNumberSearch')
export class MultipleNumberSearchController {

    constructor(private readonly service: MultipleNumberSearchService) { }
    /**
     * @params list of phone numbers of senders
     * response list containing phone numbers and thier spam status
     */

    @Post('getDetailsForNumbers')
    async getSpammerDetailsFornumber(@Body() phoneNumbers: RequestDTO){

     let res : RehashedItemWithOldHash[] = await this.service.getDetailsForNumbers(phoneNumbers)
     /**
      * for testing 
      */

       return {contacts:res}
       
    }
}
