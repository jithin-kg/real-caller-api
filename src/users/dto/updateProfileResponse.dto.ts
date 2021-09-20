import { IsString } from "class-validator";

export class UpdateProfileResponseDTO {

    firstName : string = "";
    lastName:string = "";
    email:string = "";
    bio:string = "";
    image? : string =""
}