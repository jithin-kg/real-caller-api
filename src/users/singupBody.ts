import { IsString } from "class-validator";

export class SignupBodyDto {
    @IsString()
    firstName: string

    @IsString()
    lastName: string
}