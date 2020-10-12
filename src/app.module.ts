import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './users/user.module';
import { FirebaseMiddleware } from './auth/firebase.middleware';
import { ContactModule } from './contact/contact.module';
import { SearchModule } from './search/search.module';
import { SpamModule } from './spam/spam.module';


@Module({
  imports: [UserModule,
    SearchModule,
    ContactModule,
    SpamModule
    // MongooseModule.forRoot("mongodb+srv://rlclerDBUser:IJVezz622jI7k83m@rlcaller-rest-cluster0-40d1h.mongodb.net/phoneNumberPrefixLocationMap?retryWrites=true&w=majority")
  ],
  controllers: [AppController],
  providers: [AppService],
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
