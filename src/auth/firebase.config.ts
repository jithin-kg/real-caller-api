
import * as firebaseAdmin from "firebase-admin"
import { BasicAccessTokenData, HAccessTokenData } from "./accessToken.dto";


export class Firebaseconfig { 
    static async validate(token:string, request: any):Promise<boolean>{
        try{
            const decodedToken = await firebaseAdmin.auth().verifyIdToken(token)
             //her I can get phone number from tokenVerify.phone_number
            const tokenData = new BasicAccessTokenData()
            tokenData.uid = decodedToken.uid
            request.body.tokenData = tokenData
            
            return true;
               
        }
        catch(e){
            console.log(`Firebaseconfig exception ${e}`)
            return false;
            // throw new HttpException("Bad request" , HttpStatus.BAD_REQUEST)
        }
    }

    static async validateHuser(token:string, request:any):Promise<HAccessTokenData>{
        try{
            // console.log("----token:",token)
            const decodedtoken = await firebaseAdmin.auth().verifyIdToken(token)
            // tokenVerify.uid
            let tokenData = new HAccessTokenData()
            tokenData.uid = decodedtoken.uid
            tokenData.huid = decodedtoken.hUserId;
            
            
            return tokenData;
               
        }
        catch(e){
            console.log(`Firebaseconfig exception ${e}`)
            return null;
            // throw new HttpException("Bad request" , HttpStatus.BAD_REQUEST)
        }
    }












    static initParams(){

        const params: FirebaseAdminParams = {
            type: process.env.TYPE,
            project_id: process.env.PROJECT_ID,
            privateKeyId: process.env.PRIVATE_KEY_ID,
            privateKey: process.env.PRIVATE_KEY,
            clientEmail: process.env.CLIENT_EMAIL,
            clientId: process.env.CLIENT_ID,
            authUri: process.env.AUTH_URI,
            tokenUri: process.env.TOKEN_URI,
            authProviderX509CertUrl: process.env.AUTH_PROVIDER_X509_CERT_URL,
            clientC509CertUrl: process.env.CLIENT_X509_CERT_URL
          };

        firebaseAdmin.initializeApp({
            credential: firebaseAdmin.credential.cert(params)
        })
    }

}

interface FirebaseAdminParams {
    type: string;
    project_id: string;
    privateKeyId: string;
    privateKey: string;
    clientEmail: string;
    clientId: string;
    authUri: string;
    tokenUri: string;
    authProviderX509CertUrl: string;
    clientC509CertUrl: string;
  }