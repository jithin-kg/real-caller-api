import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Contact } from "./contact.schema";

export class ContactService {
    constructor(@InjectModel("Contact") private readonly contactModel: Model<Contact>) { }

}