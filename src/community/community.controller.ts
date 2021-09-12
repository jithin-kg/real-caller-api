import { Body, Controller, Post, Res, UseGuards } from "@nestjs/common";
import { AuthGuard } from "src/auth/guard/auth.guard";
import { HAuthGuard } from "src/auth/guard/hAuth.guard";
import { CommunityService } from "./community.service";
import { NameSuggestionDto } from "./dto/suggestedName.dto";
import { Response } from "express";

@Controller("community")
export class CommunityController {
  constructor(private readonly service: CommunityService) { }
 
  @UseGuards(HAuthGuard)
  @Post("suggestName")
  async suggestName(@Body() body: NameSuggestionDto,  @Res({passthrough:true}) res:Response ) {
    const result =  await  this.service.saveNameSuggetions(body);
    res.status(result.statusCode)
    return result;
  }

  @UseGuards(HAuthGuard)
  @Post("upvoteName")
  async upvoteName(@Body() body: NameSuggestionDto, @Res({passthrough:true}) res:Response ) {
   const result = await  this.service.upvoteName(body);
   res.status(result.statusCode)
    return result
  }

  @UseGuards(HAuthGuard)
  @Post("downvoteName")
  async downvoteName(@Body() body: NameSuggestionDto,  @Res({passthrough:true}) res:Response ) {
   const result = await  this.service.downvoteName(body);
   res.status(result.statusCode)
    return result;
  }


  @UseGuards(HAuthGuard)
  @Post("upVote")
  async upVote(@Body() body: NameSuggestionDto) {
   await  this.service.saveNameSuggetions(body);
    return ""
  }

  
}