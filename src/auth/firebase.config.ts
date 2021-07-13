
import * as firebaseAdmin from "firebase-admin"
import { BasicAccessTokenData, HAccessTokenData } from "./accessToken.dto";
import * as firebaseServiceAccount from './hashcaller2-firebase-adminsdk-7uc9d-1b78a345bf.json';

export class Firebaseconfig { 
    static async validate(token:string, request: any):Promise<boolean>{
        try{
            console.log("----token:",token)
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
            console.log("----token:",token)
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












    static initParams(params:FirebaseAdminParams){
        firebaseAdmin.initializeApp({
            credential: firebaseAdmin.credential.cert(params)
        })
    }
    static params:FirebaseAdminParams = {
        type: firebaseServiceAccount.type,
        projectId: firebaseServiceAccount.project_id,
        privateKeyId: firebaseServiceAccount.private_key_id,
        privateKey: firebaseServiceAccount.private_key,
        clientEmail: firebaseServiceAccount.client_email,
        clientId: firebaseServiceAccount.client_id,
        authUri: firebaseServiceAccount.auth_uri,
        tokenUri: firebaseServiceAccount.token_uri,
        authProviderX509CertUrl: firebaseServiceAccount.auth_provider_x509_cert_url,
        clientC509CertUrl: firebaseServiceAccount.client_x509_cert_url
      }
    

}

interface FirebaseAdminParams {
    type:string;
    projectId:string;
    privateKeyId:string;
    privateKey:string;
    clientEmail:string;
    clientId:string;
    authUri:string;
    tokenUri:string;
    authProviderX509CertUrl:string;
    clientC509CertUrl:string;
  }