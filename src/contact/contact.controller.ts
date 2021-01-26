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
    // 852a2f07fc7724b078e781050b80026cc92ab6c4cf7aaa70aff86d36f9c16d59
        console.log("inside upload contact controller")
         let res = await this.contactService.uploadBulk(contactsDTO.contacts, contactsDTO.countryCode, contactsDTO.countryISO)   

         return {message:"1", "cntcts":res}
        //    let res = await  this.contactService.upload(contacts)
        //    return {"message":"1", "cntcts":[{"name":"jithin",
        //    "phoneNumber":"918086176336", 
        //     "carrier":"vodafone",
        //     "location":"banglorre",
        //     "line_type":"mobile",
        //     "country":"IN",
        //     "spammerStatus":{
        //         "spammer":"false",
        //         "spamCount":0
        //     }
        //     }]}
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



