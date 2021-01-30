import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/db/Database.Module';
import { NumberTransformService } from 'src/utils/numbertransform.service';
import {CallsController} from "./calls.controller";
import {CallService} from "./calls.service";

@Module({

     /**
     * Register the schema , then it is ready to be used in service
     */
    imports: [DatabaseModule],
    // imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
    controllers: [CallsController],
    providers: [CallService, NumberTransformService]
})
export class CallsModule {}
