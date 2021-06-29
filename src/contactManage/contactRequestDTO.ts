import { IsString, MaxLength } from "class-validator";

export class ContactRequestDTO{
  
  @IsString()
  @MaxLength(20)
  phoneNumber:string;

  @MaxLength(100)
  @IsString()
  name:string;

  @MaxLength(256)
  @IsString()
  hashedPhoneNumber:string
  
}