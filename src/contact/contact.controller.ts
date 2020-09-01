import { Controller, Post, Body } from "@nestjs/common";
import { ContactService } from "./contact.service";
import { ContactDto } from "./contact.dto";

@Controller('contact')
export class ContactController {
    constructor(private readonly contactService: ContactService) { }

    @Post('uploadcontacts')
    async uploadcontacts(@Body() contacts: ContactDto) {
        //if the body does not contact we simply return a normal response
        if (!(contacts instanceof Array))
            return { message: "ok" };

        const mval = await this.doSomething()
        console.log(mval);

    }

    doSomething(): Number {
        return 2;
    }
}