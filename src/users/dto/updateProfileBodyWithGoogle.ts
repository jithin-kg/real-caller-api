import { Type } from "class-transformer";
import { IsEmail, IsString, Length, ValidateNested} from "class-validator";
import { BasicAccessTokenData, HAccessTokenData } from "src/auth/accessToken.dto";
import { GoogleProfileDTo } from "./googleProfile.dto";

export class UpdateProfileWithGoogleDTO {
    
    @Length(1, 40)
    firstName: string

    @Length(1, 40)
    lastName: string

    @Length(0, 150)
    email:string;

    @Length(0, 200)
    bio:string;

    @Length(0, 10000)
    avatarGoogle:string;

    @ValidateNested()
    @Type(()=> GoogleProfileDTo)
    googleProfile: GoogleProfileDTo
    
    @ValidateNested()
    @Type(()=> HAccessTokenData)
    tokenData:HAccessTokenData

}

