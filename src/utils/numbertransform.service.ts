import { Injectable } from "@nestjs/common";

/**
 * script that tranform hashed number recieved from client 
 * and add secret and hash again
 */
const hash = require('crypto').createHash;

@Injectable()
export class NumberTransformService {  
    /**
     * @param hashedPhoneNum -> number recieved from client
     * @returns transformed number
     * @constant secret from -my secret
     */
    async tranforNum(hashedPhoneNum:string): Promise<string>{
        let no = await hash('sha256').update(hashedPhoneNum).digest('base64')
        //todo add secret 
        return no;

    }
    
}