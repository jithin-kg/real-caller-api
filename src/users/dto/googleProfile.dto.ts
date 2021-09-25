import { IsEmail, IsString, Length, ValidateNested} from "class-validator";

export class GoogleProfileDTo{

    @Length(0, 50)
     firstName: string;
     
     @Length(0, 50)
     lastName: string;
     
     @Length(0, 150)
     email:string;
}