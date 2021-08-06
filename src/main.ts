import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
import {ClusterService} from "./ClusterService";
import {ConfigService} from './config.service'
import * as bodyParser from 'body-parser';
import { Firebaseconfig } from './auth/firebase.config';
import * as helmet from 'helmet';
//important mongodb security
// https://docs.mongodb.com/manual/faq/fundamentals/#faq-developers-when-to-use-gridfs
dotenv.config();

async function bootstrap() {
  
  const app = await NestFactory.create(AppModule);
  const portNumber = 8080;
// app.useGlobalPipes(new ValidationPipe({disableErrorMessages:true}))
  app.use(helmet());
  app.useGlobalPipes(new ValidationPipe({whitelist: true,forbidNonWhitelisted:true, 
    transform:true,
  }))
  /**
   * To avoid 
   * Nest.js - request entity too large PayloadTooLargeError: request entity too large
   * I used body parser to recieve large amount of request body
   * https://stackoverflow.com/questions/52783959/nest-js-request-entity-too-large-payloadtoolargeerror-request-entity-too-larg/52785747
   */
  
  app.use(bodyParser.json({limit: '50mb'}));
  app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

  await app.listen(portNumber, ()=>{
    //initialise firebase admin sdk
    Firebaseconfig.initParams(Firebaseconfig.params)
    console.log(`app listening on port number ${portNumber}`)
  });

}
https://javascript.plainenglish.io/how-to-run-your-nestjs-server-in-cluster-mode-properly-acbbd4949732
//this is using cluster to - clusterize app
// ClusterService.clusterize(bootstrap)

//this is normal way, use this in developing environment
bootstrap();
