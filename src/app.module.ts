import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FirebaseMiddleware } from './auth/firebase.middleware';
import { CallsModule } from "./calls/calls.module";
import { CommunityModule } from './community/community.module';
import { ContactModule } from './contact/contact.module';
import { ContactManageModule } from './contactManage/contactManage.module';
import { DatabaseModule } from './db/Database.Module';
import { MultipleNumberSearchController } from './multiple-number-search/multiple-number-search.controller';
import { MultipleNumberSearchService } from './multiple-number-search/multiple-number-search.service';
import { MultiplenumbersearchModule } from './multiple-number-search/multiplenumbersearch.module';
import { SearchModule } from './search/search.module';
import { SpamModule } from './spam/spam.module';
import { UserModule } from './users/user.module';
import { NumberTransformService } from './utils/numbertransform.service';


@Module({
  imports: [
    UserModule,
    SearchModule,
    ContactModule, 
    ContactManageModule,
    SpamModule,
    MultiplenumbersearchModule,
    CallsModule,
    DatabaseModule,
    CommunityModule,
    MulterModule.register({ dest: './files', })
    // MongooseModule.forRoot("mongodb+srv://rlclerDBUser:IJVezz622jI7k83m@rlcaller-rest-cluster0-40d1h.mongodb.net/phoneNumberPrefixLocationMap?retryWrites=true&w=majority")
  ],
  controllers: [AppController, MultipleNumberSearchController],
  providers: [AppService, MultipleNumberSearchService, NumberTransformService]
})

/**
 * Modules that include middleware have to implement NestModule.
 * Here we Apply the firebase token authentication to all routes
 * that is why we are implementing the NestModule interface in AppModule
 * 
 */
export class AppModule implements NestModule {

  configure(consumer: MiddlewareConsumer) {
    // in forRoutes we apply this middleware to all
    // consumer
    //   .apply(FirebaseMiddleware)
    //   .forRoutes({ path: "*", method: RequestMethod.ALL })

  }
}
