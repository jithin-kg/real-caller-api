import { Controller, Post, Body, Get } from "@nestjs/common";
import {Logger} from '../utils/logger';
import { resolve } from "path";
import { SpamDTO } from "./spam.dto";

import { SpamService } from "./spam.service";

@Controller('spam')
export class Spamcontroller {
    constructor(private readonly service: SpamService) { }

    @Post('report')
    async report(@Body() spamData: SpamDTO) {
       Logger.log("spamController", "inside report ");
    //   await this.sleep()
    console.log(`uid is ${spamData.uid}`)
    let d = await this.service.reportSpam(spamData)
    
    // console.log("search result " + d[0]);

    return {"message":"1", "cntcts":d}; 
    }
}