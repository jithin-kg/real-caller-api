
/**
 * retrieves keys from google cloud secret manager
 * serve it to the needed components
 * The keys should be retrieved from secret manager
 * when application loads and set in main memory, by assigning to a variable
 */
import * as path from 'path';
import * as fs from 'fs'
export class KeyManager{

    /**
     * 
     */
    async  getPublicKey(): Promise<string>{
        const absolutePath = path.resolve('./src/Keymanager/rsa_4096_pub_for_client.pem')
        const publicKey = fs.readFileSync(absolutePath, 'utf8')
        return publicKey
    }
}