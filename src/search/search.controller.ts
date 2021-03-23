import { Controller, Post, Body, Get } from "@nestjs/common";
import { resolve } from "path";
import { SearchDTO } from "./search.dto";

import { SearchService } from "./search.service";

@Controller('find')
export class Searchcontroller {
    constructor(private readonly service: SearchService) { }

    @Post('search')
    async search(@Body() searchData: SearchDTO) {
        // 422a6198154285eef4422f6c66489c82fd9eeeae6d0ac55bc04fa527cc5ee83b
        //422a6198154285eef4422f6c66489c82fd9eeeae6d0ac55bc04fa527cc5ee83b
    //   await this.sleep()
    let d = await this.service.search(searchData.phoneNumber)
    
    // console.log("search result " + d[0]);

    
    return {"message":"1", "cntcts":d}; 
    }
}