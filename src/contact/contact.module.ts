import { Module } from "@nestjs/common";
import { ContactController } from "./contact.controller";
import { ContactService } from "./contact.service";
import { MongooseModule } from "@nestjs/mongoose";
import { Contact, ContactSchema } from "./contact.schema";
import { DatabaseModule } from "src/db/Database.Module";

@Module({
    // imports: [MongooseModule.forFeature([{ name: Contact.name, schema: ContactSchema }, {
    //     name: Indiaprefixlocationmaps.name, schema:CarrierInfoSchema
    // }])],
    imports: [DatabaseModule],
    controllers: [ContactController],
    providers: [ContactService]
})
export class ContactModule {

}