import { Module } from "@nestjs/common";
import { DatabaseModule } from "src/db/Database.Module";
import { NumberTransformService } from "../utils/numbertransform.service";
import { CommunityController } from "./community.controller";
import { CommunityService } from "./community.service";


@Module({
    /**
     * Register the schema , then it is ready to be used in service
     */
    imports: [DatabaseModule],
    // imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
    controllers: [CommunityController],
    providers: [CommunityService, NumberTransformService]
})
export class CommunityModule {

}