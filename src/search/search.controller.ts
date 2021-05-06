import {Controller, Post, Body, Get, HttpStatus} from "@nestjs/common";
import { resolve } from "path";
import { GenericServiceResponseItem } from "src/utils/Generic.ServiceResponseItem";
import { SearchDTO } from "./search.dto";

import { SearchService } from "./search.service";
import {SearchResponseItem} from "./SearchResponseItem";

@Controller('find')
export class Searchcontroller {
    constructor(private readonly service: SearchService) { }

    @Post('search')
    async search(@Body() searchData: SearchDTO) {
        // 422a6198154285eef4422f6c66489c82fd9eeeae6d0ac55bc04fa527cc5ee83b
        //422a6198154285eef4422f6c66489c82fd9eeeae6d0ac55bc04fa527cc5ee83b
    //   await this.sleep()
    let d:GenericServiceResponseItem<number, any> = await this.service.search(searchData.phoneNumber)
    // console.log("search result " + d[0]);
    console.log(`returning status code ${d.statusCode} `)
    return {"status":d.statusCode, "cntcts":d.data};
    }
}