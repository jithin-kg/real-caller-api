import { Document } from "mongoose";
import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";

@Schema()
export class Contact extends Document {
    @Prop({ required: true })
    phoneNumber: string

    @Prop({ required: true })
    name: string

    @Prop({ required: true })
    carrier: string

    @Prop({ required: true })
    location: string
    // @Prop({required:true})
    // coutryCode:string

}

export const ContactSchema = SchemaFactory.createForClass(Contact)