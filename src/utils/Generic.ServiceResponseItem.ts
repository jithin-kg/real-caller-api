import { HttpStatus } from "@nestjs/common";
import { CustomHtttpStatusCodes, HttpMessage } from "./Http-message.enum";

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
    /**
     * @param message message of bad request 
     * @returns 
     */
    static returnBadRequestResponse(message:string =HttpMessage.BAD_REQUEST):GenericServiceResponseItem<str> {
        return new GenericServiceResponseItem<string>(HttpStatus.BAD_REQUEST,  message, "")
    }

    static returnServerErrRes():GenericServiceResponseItem<null> {
        return new GenericServiceResponseItem<null>(HttpStatus.INTERNAL_SERVER_ERROR,  HttpMessage.INTERNAL_SERVER_ERROR)
    }

    static returnSomethingWentWrong():GenericServiceResponseItem<null> {
        return new GenericServiceResponseItem<null>(CustomHtttpStatusCodes.SOMETHING_WENT_WRONG,  HttpMessage.SOMETHING_WENT_WRONG)
    }
    /**
     * 
     * @param data: data to returned to client
     * @param sCode: status code to be returned to the client, default is 200
     * @returns 
     */
    static returnGoodResponse<T>(data:T, sCode:number = HttpStatus.OK):GenericServiceResponseItem<T>{
        return new GenericServiceResponseItem(sCode, HttpMessage.OK, data)
    }


}