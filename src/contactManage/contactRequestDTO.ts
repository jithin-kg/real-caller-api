import { IsString, Length, MaxLength } from "class-validator";

export class ContactRequestDTO{  
  @Length(0, 150)
  name:string;

  @Length(1, 150)
  hashedPhoneNumber:string
}