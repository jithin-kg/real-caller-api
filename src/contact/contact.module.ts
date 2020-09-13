import { Module } from "@nestjs/common";
import { ContactController } from "./contact.controller";
import { ContactService } from "./contact.service";
import { MongooseModule } from "@nestjs/mongoose";
import { Contact, ContactSchema } from "./contact.schema";
import { Indiaprefixlocationmaps, CarrierInfoSchema } from "src/carrierService/carrier.info.schema";

@Module({
    imports: [MongooseModule.forFeature([{ name: Contact.name, schema: ContactSchema }, {
        name: Indiaprefixlocationmaps.name, schema:CarrierInfoSchema
    }])],
    controllers: [ContactController],
    providers: [ContactService]
})
export class ContactModule {

}