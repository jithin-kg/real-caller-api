import { Module } from "@nestjs/common";
import { DatabaseModule } from "src/db/Database.Module";
import { NumberTransformService } from "../utils/numbertransform.service";
import { Usercontroller } from "./user.controller";
import { Userservice } from "./user.service";
import { UserDataManageService } from './userDataManage/userDataManage.service';


@Module({
    /**
     * Register the schema , then it is ready to be used in service
     */
    imports: [DatabaseModule],
    // imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
    controllers: [Usercontroller],
    providers: [Userservice, NumberTransformService, UserDataManageService]
})
export class UserModule {

}