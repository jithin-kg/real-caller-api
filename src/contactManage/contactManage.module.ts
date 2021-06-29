import { Module } from "@nestjs/common";
import { DatabaseModule } from 'src/db/Database.Module';
import { ContactManageController } from './contactManage.controller';
import { ContactManageService } from './contactManage.service';

@Module({
    imports: [DatabaseModule],
    controllers: [ContactManageController],
    providers: [ContactManageService]
})
export class ContactManageModule { }