import { Controller, Post, Body, Get } from "@nestjs/common";
import { ContactService } from "./contact.service";
import { ContactDto } from "./contact.dto";
import { ContactSyncDTO } from "./contactsycnDTO";

@Controller('contacts')
export class ContactController {
    constructor(private readonly contactService: ContactService) { }

    // @Get()
    // async migrateIndiPrei
    @Post("migrate")
    async migrate(@Body() data: ContactSyncDTO){
        console.log("migrate called")

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
    @Post('uploadcontacts')
    async uploadcontacts(@Body() contactsDTO: ContactSyncDTO) {
    
        console.log("inside upload contact controller")
         let res = await this.contactService.uploadBulk(contactsDTO.contacts, contactsDTO.countryCode, contactsDTO.countryISO)   

        //    let res = await  this.contactService.upload(contacts)
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
        // return {"message":"1","cntcts": [{"name":"jithin",
        //                             "phoneNumber":"918086176336", 
        //                              "carrier":"vodafone",
        //                              "location":"banglorre",
        //                              "line_type":"mobile",
        //                              "country":"IN",
        //                              "spammerStatus":{
        //                                  "spammer":"false",
        //                                  "spamCount":0
        //                              }
        //                              }] }; 
        //    return {message:"good"}

        // console.log(contacts);
           
    }

    // doSomething(): Number {
    //     return 2;
    // }
}



