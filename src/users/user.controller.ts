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
        secuser.uid = user.uid;
        
        
        setTimeout(()=>{
         this.userService.signup(secuser).then(data=>{
             console.log("after 5 secs")
            return { message: data };
         })
            
        }, 5000)
        // console.log(`result is ${result}`)
       
    }
    @Get('test')
    async test(){
        console.log("tessting");
        return {message:"hi"};
    }

}