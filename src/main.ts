import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  
  const app = await NestFactory.create(AppModule);
  const portNumber = process.env.PORT || 8000;
  // app.useGlobalPipes(new ValidationPipe({disableErrorMessages:true}))
  await app.listen(portNumber, ()=>{

    console.log(`app listening on port number ${portNumber}`)
  });

}


bootstrap();
