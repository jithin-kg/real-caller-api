import { IsString, MaxLength } from 'class-validator';
export class ReqContactDTO {
    @MaxLength(100)
    @IsString()
    name: string;

    @MaxLength(256)
    @IsString()
    hashedPhoneNumber: string
}