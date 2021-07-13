import {
    Body, Controller,
    Post,
    Req,
    UseGuards
} from "@nestjs/common";
import { HAuthGuard } from "src/auth/guard/hAuth.guard";
import {
    Logger
} from '../utils/logger';
import {
    SpamDTO
} from "./spam.dto";
import {
    SpamService
} from "./spam.service";
import {
    UidOnlyRequest
} from "./uidOnlyRequest";



@Controller('spam')
@UseGuards(HAuthGuard)
export class Spamcontroller {
    constructor(private readonly service: SpamService) { }

    @Post('report')
    async report(@Body() spamData: SpamDTO, @Req() _request: any) {
        Logger.log("spamController", "inside report ");
        //   await this.sleep()
        console.log(`uid is ${spamData.uid}`)
        let d = await this.service.reportSpam(spamData, _request)

        // console.log("search result " + d[0]);

        return {
            "message": "1",
            "cntcts": d
        };
    }

    @Post('unblock')
    async unblock(@Body() _spamData: SpamDTO, @Req() _request: any) {
        let response = 1;
        await this.service.unblockService(_spamData, _request).catch(() => {
            response = 0;
        })
        return {
            "message": response,
        }
    }
    @Post('incrementTotalSpamCount')
    async incrementTotalSpamCount(@Body() ui: UidOnlyRequest) {
        console.log('worked')
        await this.service.incrementTotalSpamCount()
    }
}