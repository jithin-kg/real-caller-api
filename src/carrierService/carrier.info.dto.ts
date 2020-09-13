import { IsString, min } from "class-validator";

export class CarrierInfoDTO extends Map{
    @IsString()
    prefix;
    @IsString()
    location;
    @IsString()
    carrier;
    @IsString()
    line_type;
}
