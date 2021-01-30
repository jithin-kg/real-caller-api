import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './users/user.module';
import { FirebaseMiddleware } from './auth/firebase.middleware';
import { ContactModule } from './contact/contact.module';
import { SearchModule } from './search/search.module';
import { SpamModule } from './spam/spam.module';
import { MultipleNumberSearchController } from './multiple-number-search/multiple-number-search.controller';
import { MultipleNumberSearchService } from './multiple-number-search/multiple-number-search.service';
import { MultiplenumbersearchModule } from './multiple-number-search/multiplenumbersearch.module';
import { DatabaseModule } from './db/Database.Module';
import { NumberTransformService } from './utils/numbertransform.service';
import {CallsModule} from "./calls/calls.module";


@Module({
  imports: [
    UserModule,
    SearchModule,
    ContactModule,
    SpamModule,
    MultiplenumbersearchModule,
    CallsModule,
    DatabaseModule
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
    consumer
      .apply(FirebaseMiddleware)
      .forRoutes({ path: "*", method: RequestMethod.ALL })

  }
}
