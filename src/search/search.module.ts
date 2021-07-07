import { Module } from "@nestjs/common";

import { DatabaseModule } from "src/db/Database.Module";
import { Searchcontroller } from "./search.controller";
import { SearchService } from "./search.service";

@Module({
    /**
     * Register the schema , then it is ready to be used in service
     */
    imports: [DatabaseModule],
    // imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
    controllers: [Searchcontroller],
    providers: [SearchService]
})

export class SearchModule {

}