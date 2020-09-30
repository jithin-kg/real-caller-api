import { Module } from "@nestjs/common";
import { Usercontroller } from "./user.controller";
import { Userservice } from "./user.service";

import { DatabaseModule } from "src/db/Database.Module";

@Module({
    /**
     * Register the schema , then it is ready to be used in service
     */
    imports: [DatabaseModule],
    // imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
    controllers: [Usercontroller],
    providers: [Userservice]
})
export class UserModule {

}