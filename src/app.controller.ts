import { Body, Controller, Get, Post, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { AppService } from './app.service';
import { HAuthGuard } from './auth/guard/hAuth.guard';
import { SearchDTO } from './multiple-number-search/search.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  getHello(): string {
    return "hello"
  }
  
}
