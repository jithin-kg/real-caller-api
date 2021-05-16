export class Formatter {
    static getFormatedPhoneNumber(num:string){
        return num.replace(RegExp("[^A-Za-z0-9]"), "").trim()
    }
}