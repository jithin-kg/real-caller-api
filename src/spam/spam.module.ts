import { Module } from "@nestjs/common";

import { DatabaseModule } from "src/db/Database.Module";
import { NumberTransformService } from "src/utils/numbertransform.service";
import { Spamcontroller } from "./spam.controller";
import { SpamService } from "./spam.service";

@Module({
    /**
     * Register the schema , then it is ready to be used in service
     */
    imports: [DatabaseModule],
    // imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
    controllers: [Spamcontroller],
    providers: [SpamService, NumberTransformService]
})
export class SpamModule {

}