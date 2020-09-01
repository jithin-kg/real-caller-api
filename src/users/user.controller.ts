import { Controller, Post, Body, Get } from "@nestjs/common";
import { Userservice } from "./user.service";
import { UserDto } from "./user.dto";

@Controller('user')
export class Usercontroller {
    constructor(private readonly userService: Userservice) { }

    @Post('signup')
    async signUp(@Body() user: UserDto) {
        const secuser: UserDto = Object.create(null);
        console.log(user)
        secuser.firstName = user.firstName;
        secuser.email = user.email;
        // secuser.accountType = user.accountType== undefined ?"premium":"regular";
        secuser.accountType = user.accountType = "premium";
        
        const result = await this.userService.signup(secuser)
        // console.log(`result is ${result}`)
        return { result: result };
    }
    @Get('test')
    async test(){
        console.log("tessting");
        return {message:"hi"};
    }

}