import { reject } from 'async';
import * as CryptoJS from 'crypto-js';
import { ReqContactDTO } from './reqContactDTO';
const SECRET_KEY: string = "___thisissecretkey___";
export function do_AES_decryption(decryptedString: string): Promise<ReqContactDTO[]> {
    return new Promise(async (resolve, reject )=> {
        Promise.resolve().then(async res=> {
            try {
                var bytes = CryptoJS.AES.decrypt(decryptedString, SECRET_KEY);
                let decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8)) || [];
                resolve(decryptedData);
            } catch (error) {
                console.log("decryotion error: ", error);
                reject()
            }
        })
        
    });
}
export function do_AES_encryption(source: ReqContactDTO[]): Promise<string> {
    return new Promise(async resolve => {
        try {
            const enc = CryptoJS.AES.encrypt(JSON.stringify(source), SECRET_KEY).toString()
            resolve(enc);
        } catch (error) {
            console.log("encryption error: ", error);
            resolve("");
        }
    });
}
export function findDifference(A: ReqContactDTO[], B: ReqContactDTO[]): Promise<ReqContactDTO[]> {
    return new Promise(async resolve => {
        console.log('A:', A)
        console.log('B:', B)
        const results = A.filter(({
            hashedPhoneNumber: id1
        }) => !B.some(({
            hashedPhoneNumber: id2
        }) =>
            id2 === id1
        ));
        resolve(results)
    })
}