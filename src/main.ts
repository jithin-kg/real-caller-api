import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';



async function bootstrap() {
  
  const app = await NestFactory.create(AppModule);
  const portNumber = 3000;
  app.useGlobalPipes(new ValidationPipe({disableErrorMessages:true}))
  await app.listen(portNumber, ()=>{

    console.log(`app listening on port number ${portNumber}`)
  });

}


bootstrap();
