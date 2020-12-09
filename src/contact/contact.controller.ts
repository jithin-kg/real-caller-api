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






        
         let res = await this.contactService.uploadBulk(contacts)   
                

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



