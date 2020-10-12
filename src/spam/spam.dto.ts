import { Length, MaxLength, MinLength } from "class-validator";

export class SpamDTO{
    // @Length(7, 12)
    phoneNumber:string;
   @MinLength(2, {message:" Location length too short"})
   @MaxLength(30 , {message:" Location length too long"})
    locatin:String;
}