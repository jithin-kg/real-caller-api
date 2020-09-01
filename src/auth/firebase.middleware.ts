import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";

import * as firebaseAdmin from 'firebase-admin';
import * as firebaseServiceAccount from './hashcaller-a97e5-firebase-adminsdk-iaax2-66d1c9ca4d.json';
import { async } from "rxjs";

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

        // const token = req.header('Authorization').replace('Bearer', '').trim()

        // this.validateRequest(req, token);


        next();
    }
    private async validateRequest(req: Request, token) {
        const tokenVerify = await firebaseAdmin.auth().verifyIdToken(token)
        console.log(tokenVerify)

    }

}