export class GenericServiceResponseItem<StatusCode, Data>{
    statusCode:StatusCode;
    data?:Data
    constructor(statusCode : StatusCode, data?:Data) {
        this.statusCode = statusCode
        this.data = data
    }
}