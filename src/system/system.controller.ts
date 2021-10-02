import { Body, Controller, Get, Post, Res, UseGuards } from "@nestjs/common";
import { PriorityReqDto } from "./priority.dto";
import { SystemService } from "./system.service";
import { Response } from "express";
import { HAuthGuard } from "src/auth/guard/hAuth.guard";

@Controller('system')
export class SystemController {
    constructor(private readonly service: SystemService){}

    // @UseGuards(HAuthGuard)
    @Post("getPriority")
    async checkUpdatePriority(@Body() body: PriorityReqDto,  @Res({passthrough:true}) res:Response){
        const  result = await this.service.getPriorityByVersionCode(body)
        res.status(result.statusCode)
        return result
    }
    // @Get("dummy") 
    // async insertDummy() {
    //     await this.service.insertDummy()
    //     return "done"
    // }
}