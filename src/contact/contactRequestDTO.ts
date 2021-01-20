import { IsString, MaxLength } from "class-validator";

export class ContactRequestDTO{
  
  @IsString()
  @MaxLength(20)
  firstNDigits:string;
  @MaxLength(100)
  @IsString()
  name:string;
@MaxLength(256)
  @IsString()
  phoneNumber:string
  
}