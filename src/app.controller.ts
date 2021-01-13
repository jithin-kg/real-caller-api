import { Body, Controller, Get, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { AppService } from './app.service';
import { SearchDTO } from './multipleNumberSearch/search.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
  @Post()
  // @UsePipes(new ValidationPipe({ transform: true }))
  sample(@Body()data: SearchDTO):string{
    return "hi"
  }
}
