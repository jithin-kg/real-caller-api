import {Controller, Post, Body, Get, HttpStatus, Res, Req} from "@nestjs/common";
import { resolve } from "path";
import { GenericServiceResponseItem } from "src/utils/Generic.ServiceResponseItem";
import { SearchDTO } from "./search.dto";

import { SearchService } from "./search.service";
import {SearchResponseItem} from "./SearchResponseItem";
import {ManualSearchDto} from "./manualSearch.dto";
import {Response} from "express";
import { IsPhoneNumber, IsString, Length, MaxLength, MinLength } from "class-validator";



@Controller('find')
export class Searchcontroller {
    
    constructor(private readonly service: SearchService) { }

   

    @Post('search')
    async search(@Body() searchData: SearchDTO, @Res({passthrough:true}) res:Response ):Promise<GenericServiceResponseItem< SearchResponseItem|null>> {
        //5ede3a872c0a4a91ab488819296fd51ac9f06a50f383073eda31dc3dae04cd82 18086176331
    let result:GenericServiceResponseItem<SearchResponseItem> = await this.service.search(searchData.phoneNumber)
    // console.log("search result " + d[0]);
    res.status(result.statusCode)
    // return {"status":result.statusCode, "cntcts":result.data};
        return result 
    }

    @Post('manualSearch')
    async searchManual(@Body() searchData: ManualSearchDto) {
        let d:GenericServiceResponseItem< any> = await this.service.manualSearch(searchData)
        return {"status":d.statusCode, "cntcts":d.data};
    }
}