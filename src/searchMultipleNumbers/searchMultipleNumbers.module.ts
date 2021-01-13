import { Module } from "@nestjs/common";

import { DatabaseModule } from "src/db/Database.Module";
import { NumberTransformService } from "src/utils/numbertransform.service";
import { SearchMultipleNumberController } from "./searchMultipleNumber.controller";
import { SearchMultipleNumberService } from "./searchMultipleNumber.service";

@Module({
    /**
     * Register the schema , then it is ready to be used in service
     */
    imports: [DatabaseModule],
    // imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
    controllers: [SearchMultipleNumberController],
    providers: [SearchMultipleNumberService, NumberTransformService]
})
export class SearchMultipleNumberModule {

}