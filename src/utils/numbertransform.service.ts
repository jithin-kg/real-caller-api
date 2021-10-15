import { Injectable } from "@nestjs/common";

/**
 * script that tranform hashed number recieved from client 
 * and add secret and hash again
 */
const crypto = require('crypto').createHash;

@Injectable()
export class NumberTransformService {  
    /**
     * @param hashedPhoneNum -> number recieved from client
     * @returns transformed number
     * @constant secret from -my secret
     */
    async tranforNum(hashedPhoneNum:string): Promise<string> {
        //rehash num ****
        return new Promise((async (resolve, reject) => {
            try {
                // let no = await crypto('sha256').update(hashedPhoneNum).digest('hex')
                let no = crypto.createHmac("sha256", process.env.PEPPER + "eom47K4J4aNHAEKocSdwlL6QcgIyUxpU").update(hashedPhoneNum).digest("base64")
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