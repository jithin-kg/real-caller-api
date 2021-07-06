export class GenericServiceResponseItem< T>{
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
}