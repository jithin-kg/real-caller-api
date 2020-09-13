import { Controller, Post, Body } from "@nestjs/common";
import { ContactService } from "./contact.service";
import { ContactDto } from "./contact.dto";

@Controller('contacts')
export class ContactController {
    constructor(private readonly contactService: ContactService) { }

    @Post('uploadcontacts')
    async uploadcontacts(@Body() contacts: ContactDto[]) {
        //if the body does not contact we simply return a normal response
        if ((contacts instanceof Array)){
            console.log("instance of array")
            console.log(contacts)
        }else{

            console.log("not instance of array");
           
        }

                

            this.contactService.upload(contacts)

        // console.log(contacts);
           
    }

    // doSomething(): Number {
    //     return 2;
    // }
}