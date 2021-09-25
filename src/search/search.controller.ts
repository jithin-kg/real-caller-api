import {Controller, Post, Body, Get, HttpStatus, Res, Req, UseGuards} from "@nestjs/common";
import { resolve } from "path";
import { GenericServiceResponseItem } from "src/utils/Generic.ServiceResponseItem";
import { SearchDTO } from "./search.dto";

import { SearchService } from "./search.service";
import {SearchResponseItem} from "./SearchResponseItem";
import {ManualSearchDto} from "./manualSearch.dto";
import {Response} from "express";
import { IsPhoneNumber, IsString, Length, MaxLength, MinLength } from "class-validator";
import { HAuthGuard } from "src/auth/guard/hAuth.guard";



@Controller('find')
export class Searchcontroller {
    
    constructor(private readonly service: SearchService) { }



    @UseGuards(HAuthGuard)
    @Post('search')
    async search(@Body() searchData: SearchDTO, @Res({passthrough:true}) res:Response ):Promise<GenericServiceResponseItem< SearchResponseItem|null>> {
    let result:GenericServiceResponseItem<SearchResponseItem> = await this.service.search(searchData.phoneNumber)
    //ethan fergus contact upload _id : 1ff3fb9ad01dceb6d1f140966088d3b5218e27e8d4c35bee4b4fed075bf08f62
    res.status(result.statusCode)
        return result 
    }

    // @UseGuards(HAuthGuard)
    // @Post('manualSearch')
    // async searchManual(@Body() searchData: ManualSearchDto) {
    //     let d:GenericServiceResponseItem< any> = await this.service.manualSearch(searchData)
    //     return {"status":d.statusCode, "cntcts":d.data};
    // }
}