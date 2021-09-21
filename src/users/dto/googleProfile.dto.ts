import { IsEmail, IsString, Length, ValidateNested} from "class-validator";

export class GoogleProfileDTo{

    @Length(0, 50)
    @IsString()
     firstName: string;
     
     @Length(0, 50)
     @IsString()
     lastName: string;
     
     @Length(0, 100)
     @IsString()
     email:string;
}