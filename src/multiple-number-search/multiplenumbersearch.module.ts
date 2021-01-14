import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/db/Database.Module';
import { NumberTransformService } from 'src/utils/numbertransform.service';
import { MultipleNumberSearchController } from './multiple-number-search.controller';
import { MultipleNumberSearchService } from './multiple-number-search.service';

@Module({

     /**
     * Register the schema , then it is ready to be used in service
     */
    imports: [DatabaseModule],
    // imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
    controllers: [MultipleNumberSearchController],
    providers: [MultipleNumberSearchService, NumberTransformService]
})
export class MultiplenumbersearchModule {}
