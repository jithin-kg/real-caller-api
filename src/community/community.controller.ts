import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "src/auth/guard/auth.guard";
import { HAuthGuard } from "src/auth/guard/hAuth.guard";
import { CommunityService } from "./community.service";
import { NameSuggestionDto } from "./dto/suggestedName.dto";

@Controller("community")
export class CommunityController {
  constructor(private readonly service: CommunityService) { }
 
  @UseGuards(HAuthGuard)
  @Post("suggestName")
  async suggestName(@Body() body: NameSuggestionDto) {
   await  this.service.saveNameSuggetions(body);
    return ""
  }
  @UseGuards(HAuthGuard)
  @Post("upVote")
  async upVote(@Body() body: NameSuggestionDto) {
   await  this.service.saveNameSuggetions(body);
    return ""
  }

  
}