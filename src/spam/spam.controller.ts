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
    async report(@Body() spamData: SpamDTO, @Req() _request: any) {
        Logger.log("spamController", "inside report ");
        //   await this.sleep()
        let d = await this.service.reportSpam(spamData, _request)
        return {
            "message": "1",
            "cntcts": d
        };
    }
    @UseGuards(HAuthGuard)
    @Post('unblock')
    async unblock(@Body() _spamData: SpamDTO) {
        let response = 1;
        await this.service.unblockService(_spamData).catch(() => {
            response = 0;
        })
        return {
            "message": response,
        }
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