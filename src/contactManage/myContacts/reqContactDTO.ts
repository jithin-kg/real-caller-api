import { IsString, Length, MaxLength } from 'class-validator';
export class ReqContactDTO {
    @IsString()
    @MaxLength(100)
    name: string;

    @IsString()
    @Length(64, 64)
    hashedPhoneNumber: string
}