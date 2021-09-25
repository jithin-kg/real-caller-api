import { IsString, Length, MaxLength } from 'class-validator';
export class ReqContactDTO {
    @Length(0, 150)
    name: string;

    @Length(4, 100)
    hashedPhoneNumber: string
}