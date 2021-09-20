import { Controller, Post, Body, Get } from "@nestjs/common";
import { ContactService } from "./contact.service";
import { ContactDto } from "./contact.dto";
import { ContactSyncDTO } from "./contactsycnDTO";
import {start} from "repl";

@Controller('contacts_sdf')
export class ContactController {
    private name:string = ""
    constructor(private readonly contactService: ContactService) { }
    
    // @Get()
    // async migrateIndiPrei
    @Post("migrate")
    async migrate(@Body() data: ContactSyncDTO){

        // this.contactService.migrate();
        return {"message":"1", "cntcts":[{"name":"jithin",
        "phoneNumber":"918086176336", 
         "carrier":"vodafone",
         "location":"banglorre",
         "line_type":"mobile",
         "country":"IN",
         "spammerStatus":{
             "spammer":"false",
             "spamCount":0
         }
         }]}
    }
    // @Post('uploadcontacts')
    // async uploadcontacts(@Body() contactsDTO: ContactSyncDTO) {
    //
    //     // const startTime = new Date()
    //     //8e5eeb77aa08c692dc0208360af5227cc06113c1f0ed212a304fe6151f0dddd4
    //      let res = await this.contactService.uploadBulk(contactsDTO.contacts, contactsDTO.countryCode, contactsDTO.countryISO)
    //     const endTime = new Date()
    //     // const comparison:number = endTime.getTime() - startTime.getTime()
    //     // console.log(`time comparison ${comparison}`)
    //      return {contacts:res}
    //     //    let res = await  this.contactService.upload(contacts)d
    //     //    return {"message":"1", "cntcts":[{"name":"jithin",
    //     //    "phoneNumber":"918086176336",
    //     //     "carrier":"vodafone",
    //     //     "location":"banglorre",
    //     //     "line_type":"mobile",
    //     //     "country":"IN",
    //     //     "spammerStatus":{
    //     //         "spammer":"false",
    //     //         "spamCount":0
    //     //     }
    //     //     }]}
    //     // return {"message":"1","cntcts": [{"name":"jithin",
    //     //                             "phoneNumber":"918086176336",
    //     //                              "carrier":"vodafone",
    //     //                              "location":"banglorre",
    //     //                              "line_type":"mobile",
    //     //                              "country":"IN",
    //     //                              "spammerStatus":{
    //     //                                  "spammer":"false",
    //     //                                  "spamCount":0
    //     //                              }
    //     //                              }] };
    //     //    return {message:"good"}
    //
    //     // console.log(contacts);
    //
    // }

    // doSomething(): Number {
    //     return 2;
    // }
}



