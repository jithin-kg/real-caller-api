import { Injectable, NestMiddleware, HttpException, HttpStatus } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";

import * as firebaseAdmin from 'firebase-admin';
import * as firebaseServiceAccount from './hashcaller-a97e5-firebase-adminsdk-iaax2-975c7d32cf.json';
import { async } from "rxjs";
import { DH_UNABLE_TO_CHECK_GENERATOR } from "constants";

@Injectable()
export class FirebaseMiddleware implements NestMiddleware {
    constructor() {

        const params = {
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

        firebaseAdmin.initializeApp({
            credential: firebaseAdmin.credential.cert(params)
        })
    }
    async use(req: Request, res: Response, next: NextFunction) {

        const token = req.header('Authorization').replace('Bearer', '').trim()
         console.log(req.header('Authorization')) ;  
        await this.validateRequest(req, token); 
        next();
    }
    private async validateRequest(req: Request, token) {
        try{
            const tokenVerify = await firebaseAdmin.auth().verifyIdToken(token)
        
            if (tokenVerify.admin == true) {
                console.log("Admin");
            } else {
                console.log("Not admin");
            }
            req.body.uid = tokenVerify.uid; // setting user id in the request object
            // console.log(req.body.username);
            console.log(tokenVerify.uid)
            console.log("token verify is "+tokenVerify)
        }catch(e){
            /**
             * can be thrown due to expired/ invalid token
             */
            console.log("token verification failed" + e)
            throw new HttpException("Bad request" , HttpStatus.BAD_REQUEST)
            
        }
        

    }

}