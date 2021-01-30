import { Body, Controller, Post } from '@nestjs/common';
import {CallService} from "./calls.service";
import {RequestDTO} from "../multiple-number-search/requestDTO";
import {RehashedItemWithOldHash} from "../multiple-number-search/RehashedItemwithOldHash";


@Controller('call')
export class CallsController {
    constructor(private readonly service: CallService) { }
    /**
     * @params list of phone numbers of senders
     * response list containing phone numbers and thier spam status
     */

    @Post('getDetailsForNumbers')
    async getSpammerDetailsFornumber(@Body() phoneNumbers: RequestDTO){
      console.log(`size multiplesearch ${phoneNumbers.hashedPhoneNum.length}`)
      console.log(`req body is ${phoneNumbers}`)

     let res : RehashedItemWithOldHash[] = await this.service.getDetailsForNumbers(phoneNumbers)
     console.log("-----------------returning multiplenubmer search---------------------")
      
     /**
      * for testing 
      */

       return {contacts:res}
       
    }
}
