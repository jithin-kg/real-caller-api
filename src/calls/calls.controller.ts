import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import {CallService} from "./calls.service";
import {RequestDTO} from "../multiple-number-search/requestDTO";
import {RehashedItemWithOldHash} from "../multiple-number-search/RehashedItemwithOldHash";
import { HAuthGuard } from 'src/auth/guard/hAuth.guard';
import { GenericServiceResponseItem } from 'src/utils/Generic.ServiceResponseItem';
import { Response } from "express";


@Controller('call')
@UseGuards(HAuthGuard)
export class CallsController {
    constructor(private readonly service: CallService) { }
    /**
     * @params list of phone numbers of senders
     * response list containing phone numbers and thier spam status
     */
    @Post('getDetailsForNumbers')
    async getSpammerDetailsFornumber(
      @Body() phoneNumbers: RequestDTO,
      @Res({passthrough:true}) res: Response
      
      ): Promise<GenericServiceResponseItem<RehashedItemWithOldHash[]|null>>{
      console.log(`size multiplesearch ${phoneNumbers.hashedPhoneNum.length}`)
      console.log(`req body is ${phoneNumbers}`)

     let result = await this.service.getDetailsForNumbers(phoneNumbers)
     res.status(result.statusCode)
     console.log("-----------------returning multiplenubmer search---------------------")
      return result;
     /**
      * for testing 
      */
      //  return {contacts:res}
       
    }
}
