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
    async tranforNum(hashedPhoneNum:string): Promise<string> {
        //rehash num
        return new Promise((async (resolve, reject) => {
            try {
                let no = await hash('sha256').update(hashedPhoneNum).digest('hex')
                //todo add secret
                resolve (no);
                //UCqdkxQa5AI5lGubpIZ37+mgLOmjwgix/dj7isml/mU=
            } catch (e) {
                console.error(`error while tranforming number ${e}`)
                reject(e)
            }
        }))


    }
    
}