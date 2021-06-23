import {Controller, Post, Body, Get, HttpStatus} from "@nestjs/common";
import { resolve } from "path";
import { GenericServiceResponseItem } from "src/utils/Generic.ServiceResponseItem";
import { SearchDTO } from "./search.dto";

import { SearchService } from "./search.service";
import {SearchResponseItem} from "./SearchResponseItem";
import {ManualSearchDto} from "./manualSearch.dto";

@Controller('find')
export class Searchcontroller {
    constructor(private readonly service: SearchService) { }

    @Post('search')
    async search(@Body() searchData: SearchDTO) {
        //5ede3a872c0a4a91ab488819296fd51ac9f06a50f383073eda31dc3dae04cd82 18086176331
    let d:GenericServiceResponseItem<number, any> = await this.service.search(searchData.phoneNumber)
    // console.log("search result " + d[0]);
    console.log(`returning status code ${d.statusCode} `)
    return {"status":d.statusCode, "cntcts":d.data};
    }


    @Post('manualSearch')
    async searchManual(@Body() searchData: ManualSearchDto) {
        let d:GenericServiceResponseItem<number, any> = await this.service.manualSearch(searchData)
    
    
        return {"status":d.statusCode, "cntcts":d.data};
    }
}