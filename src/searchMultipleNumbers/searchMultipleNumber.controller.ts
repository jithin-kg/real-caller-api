import { Controller, Post, Body, Get, ValidationPipe } from "@nestjs/common";
import {Logger} from '../utils/logger';
import { resolve } from "path";
import { SearchMultipleNumberService } from "./searchMultipleNumber.service";
import { RequestDTO } from "./requestDTO";


@Controller('searchMultiple')
export class SearchMultipleNumberController {
    constructor(private readonly service: SearchMultipleNumberService) { }
    /**
     * @params list of phone numbers of senders
     * response list containing phone numbers and thier spam status
     */

     @Post('getDetailsForNumbers')
     async getSpammerDetailsFornumber(@Body() phoneNumbers: RequestDTO){
       
      let res = await this.service.getDetailsForNumbers(phoneNumbers)
        return "got spammer list s"
        
     }
}