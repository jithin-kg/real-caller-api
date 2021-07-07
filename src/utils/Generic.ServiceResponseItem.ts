import { HttpStatus } from "@nestjs/common";
import { HttpMessage } from "./Http-message.enum";

export class GenericServiceResponseItem<T>{

    statusCode:number;
    data?:T
    message:string;
    
    constructor(
        statusCode : number, 
        message:string,
        data?:T
        
        ) {
            
        this.statusCode = statusCode
        this.data = data
        this.message = message
    }

    static returnBadRequestResponse():GenericServiceResponseItem<null> {
        return new GenericServiceResponseItem<null>(HttpStatus.BAD_REQUEST,  HttpMessage.BAD_REQUEST)
    }

    static returnGoodResponse<T>(data:T):GenericServiceResponseItem<T>{
        return new GenericServiceResponseItem(HttpStatus.OK, HttpMessage.OK, data)
    }
}