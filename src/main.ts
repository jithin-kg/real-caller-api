import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';



async function bootstrap() {
  
  const app = await NestFactory.create(AppModule);
  const portNumber = 3000;
  await app.listen(portNumber, ()=>{

    console.log(`app listening on port number ${portNumber}`)
  });

}


bootstrap();
