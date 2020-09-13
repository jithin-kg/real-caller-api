import { Document } from "mongoose";
import { Prop } from "@nestjs/mongoose";
import { SchemaFactory, Schema } from "@nestjs/mongoose";
@Schema()
export class Indiaprefixlocationmaps extends Document{
    @Prop({required:true})
    prefix?:string;
    @Prop({required:true})
    location?:string;
    @Prop({required:true})
    carrier?:string;
    @Prop({required:true})
    line_type?:string;
  
}
export const CarrierInfoSchema = SchemaFactory.createForClass(Indiaprefixlocationmaps);