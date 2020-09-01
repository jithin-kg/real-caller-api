import { Document, mongo, Mongoose } from "mongoose";
import { Prop, SchemaFactory, Schema } from "@nestjs/mongoose";
import * as mongoose from 'mongoose'
@Schema()
export class User extends Document {
    @Prop({ required: true })
    firstName?: string;

    @Prop({ required: true })
    email?: string;

    @Prop({ required: true })
    accountType?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

// export const UserSchema = new mongoose.Schema({
//     name: { type: String, required: true },
//     email: { type: String, required: true },
//     accountType: { type: String, required: true }

// });

// export class User extends mongoose.Document { 
//     name?: string;
//     email?: string;
//     accountType?: string;

// }
// export class ObjectId {

// }


// export const UserSchema = new mongoose.Schema(

//     {
//         _id: ObjectId,
//         firstName: String,
//         lastName: String,
//         phoneNumber: String,
//         additionalInfo: ObjectId,
//         photoUrl: [{ url1: String, url2: String, url3: String }],
//         email: String,
//         coutryCode: String,
//         gender: String,
//         spammerStatus: {
//             spammer: Boolean,
//             flagCount: Number
//         },
//         blockedCount: Number,
//         deviceId: String,
//         status: String,
//         active: Boolean,
//         buisnessAccountDetails: {
//             buisnessname: String,
//             buisnessAddress: {
//                 street: String,
//                 zipCode: String,
//                 city: String,
//                 coutry: String
//             }
//         }
//     }

// )

// export const Admin = new mongoose.Schema(
//     {
//         _id: ObjectId,
//         userName: String,
//         password: String,


//     }

// )

// export const AdditionaleInfo = new mongoose.Schema(
//     {
//         _id: ObjectId,
//         ip: String,
//         ipCountry: String,
//         language: String,
//         appDetails: {
//             version: String,
//             store: String,
//         },
//         deviceDetails: {
//             device: String,
//             os: String,
//             model: String,
//             simeSerials: [String],
//             manufacturer: String,
//             language: String,
//         },
//         simDetails: [{
//             operator: String,
//             active: Boolean,
//         }],


//     }

// )
