import { Type } from "class-transformer";
import { IsEmail, IsString, Length, ValidateNested} from "class-validator";
import { BasicAccessTokenData, HAccessTokenData } from "src/auth/accessToken.dto";
import { GoogleProfileDTo } from "./googleProfile.dto";

export class UpdateProfileWithGoogleDTO {
    
    @Length(1, 40)
    @IsString()
    firstName: string

    @Length(1, 40)
    @IsString()
    lastName: string

    @IsEmail()
    email:string;

    @IsString()
    @Length(0, 200)
    bio:string;

    @IsString()
    @Length(0, 10000)
    avatarGoogle:string;

    @ValidateNested()
    @Type(()=> GoogleProfileDTo)
    googleProfile: GoogleProfileDTo
    
    @ValidateNested()
    @Type(()=> HAccessTokenData)
    tokenData:HAccessTokenData

}

