import { Module } from "@nestjs/common";
import { DatabaseModule } from 'src/db/Database.Module';
import { NumberTransformService } from "src/utils/numbertransform.service";
import { ContactManageController } from './contactManage.controller';
import { ContactManageService } from './contactManage.service';

@Module({
    imports: [DatabaseModule],
    controllers: [ContactManageController],
    providers: [ContactManageService, NumberTransformService]
})
export class ContactManageModule { }