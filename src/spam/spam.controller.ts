import {
    Body, Controller,
    Get,
    Param,
    Post,
    Req,
    Res,
    UseGuards
} from "@nestjs/common";
import { HAccessTokenData } from "src/auth/accessToken.dto";
import { GetHAuthGuard } from "src/auth/guard/gethAuth.guard";
import { HAuthGuard } from "src/auth/guard/hAuth.guard";
import { Response } from "express";

import {
    Logger
} from '../utils/logger';
import {
    SpamDTO
} from "./dto/spam.dto";
import {
    SpamService
} from "./spam.service";
import {
    UidOnlyRequest
} from "./dto/uidOnlyRequest";



@Controller('spam')
export class Spamcontroller {
    constructor(private readonly service: SpamService) { }
        
    @UseGuards(HAuthGuard)
    @Post('report')
    async report(@Body() spamData: SpamDTO, @Res({passthrough:true}) res:Response) {
        Logger.log("spamController", "inside report ");
        //   await this.sleep()
        let result = await this.service.reportSpam(spamData)
        res.status(result.statusCode)
        return result
    }
    @UseGuards(HAuthGuard)
    @Post('unblock')
    async unblock(@Body() _spamData: SpamDTO, @Res({passthrough:true}) res:Response) {
        const result = await this.service.unblockService(_spamData)
        res.status(result.statusCode)
        return result
    }
    @UseGuards(HAuthGuard)
    @Post('incrementTotalSpamCount')
    async incrementTotalSpamCount(@Body() ui: UidOnlyRequest) {
        await this.service.incrementTotalSpamCount()
    }
    @UseGuards(GetHAuthGuard)
    @Get('spamThreshold')
    async getLatestSpamThreshold(@Param() tokenData: HAccessTokenData, @Res({passthrough:true}) res:Response){
        console.log('spamThreshold',tokenData)
        const result = await this.service.getSpamThreshold()
        res.status(result.statusCode)
        return result;
    }



}