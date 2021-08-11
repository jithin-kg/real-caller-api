import { Type } from "class-transformer";
import { ValidateNested } from "class-validator";
import { HAccessTokenData } from "src/auth/accessToken.dto";

export class DeactivateDTO {
    @ValidateNested()
    @Type(()=>HAccessTokenData)
    tokenData:HAccessTokenData
}