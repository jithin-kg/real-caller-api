import { Module } from "@nestjs/common";
import { DatabaseModule } from "src/db/Database.Module";
import { SystemController } from "./system.controller";
import { SystemService } from "./system.service";


@Module({
   imports: [DatabaseModule],
   controllers: [SystemController],
   providers: [SystemService]

})
export class SystemModule {

}