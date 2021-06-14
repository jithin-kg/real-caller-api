import { Injectable, NestMiddleware, HttpException, HttpStatus } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";

import * as firebaseAdmin from 'firebase-admin';
import * as firebaseServiceAccount from './hashcaller2-firebase-adminsdk-7uc9d-1b78a345bf.json';
import { async } from "rxjs";
import { DH_UNABLE_TO_CHECK_GENERATOR } from "constants";
import {UserIdDTO} from "../utils/UserId.DTO";
import {NumberTransformService} from "../utils/numbertransform.service";

/**
 * Todo
 * token verification failedError: Firebase ID token has expired.
 *  Get a fresh ID token from your client app and try again (auth/id-token-expired). 
 * See https://firebase.google.com/docs/auth/admin/verify-id-tokens 
 * for details on how to retrieve an ID token.
 */
@Injectable()
export class FirebaseMiddleware implements NestMiddleware {
    private static numberTransformService: NumberTransformService = new NumberTransformService();
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


    /**
     * This function is called from user signup router to get user id 
     * because we are using multi part for file handling
     * @param req
     * @returns 
     */
    static async getUserId(req:any): Promise<UserIdDTO> {
    
           return new Promise(async (resolve, reject)=>{
            try{
              const token:string = req.header('Authorization').replace('Bearer', '').trim()
            const tokenVerify = await firebaseAdmin.auth().verifyIdToken(token)
            const user = new  UserIdDTO()
            user.hUserId = tokenVerify.hUserId;
            user.userId  = tokenVerify.uid;
            resolve(user)
            }catch(e){
                reject(e)
            }
           })
    }

    static createCustomToken(uid:string, hashedNum:string):Promise<string>{
        return new Promise(async (resolve, reject)=>{
            try{
                const hUserId = await this.numberTransformService.tranforNum(uid + hashedNum)
                firebaseAdmin.auth()
                    .createCustomToken(uid, {
                        hUserId:hUserId
                    }).then((customtoken)=>{
                    console.log(`custom token is ${customtoken}`)
                    resolve(customtoken)
                }).catch((e)=>{
                    console.error(`error while creating custom token`)
                    reject(`error while creating custom token ${e}`)
                })

            }catch (e){

            }
        })
    }
    /**
     * This function is only called when enter otp
     * then with that token client request for the phone number
     *
     * @param uid
     */
    static getPhoneNumberFromToken(req:any):Promise<string> {
        return new Promise(async (resolve, reject)=>{
            try{
                const token:string = req.header('Authorization').replace('Bearer', '').trim()
                const tokenVerify = await firebaseAdmin.auth().verifyIdToken(token)
                const phoneNumber = tokenVerify.phone_number;
                console.log(`phone number in token ${ tokenVerify.phone_number}`)
                resolve(phoneNumber)
            }catch(e){
                reject(e)
            }
        })
    }
    static async removeUserById(uid:string):Promise<void>{
        try {
            await firebaseAdmin.auth().deleteUser(uid)
        }catch (e){

        }
    }

    static async desableUser(uid:string) {
       try {
           await  firebaseAdmin.auth().updateUser(uid, {
               disabled: true
           })
       }catch (e){
           console.log(`Error while desabling user`)
       }
    }
    static async removeUserPhoneNumberFromFirebase(uid:string):Promise<any>{

        return new Promise(async (resolve, reject)=> {
           try {
               // const uid = await this.getUserId(req)
               await  firebaseAdmin.auth().updateUser(uid, {
                   phoneNumber:null
               })
               resolve("done")
           }catch (e){
               console.log(`Error while removeUserPhoneNumberFromFirebase ${e}`)
               reject(e)
           }
        })

    }
    async use(req: Request, res: Response, next: NextFunction) {
        try{
            const token:string = req.header('Authorization').replace('Bearer', '').trim()
            await this.validateRequest(req, token); 
            next()
            throw new HttpException("Bad request" , HttpStatus.BAD_REQUEST)
        }
        catch(e){

        }
        //  console.log(req.header('Authorization')) ;  
       
    }
     async validateRequest(req: Request, token) {
        try{
            console.log(token)
            const tokenVerify = await firebaseAdmin.auth().verifyIdToken(token)
             //her I can get phone number from tokenVerify.phone_number
            if (tokenVerify.admin == true) {
                // console.log("Admin");
            } else {
                // console.log("Not admin");
            }
            req.body.uid = tokenVerify.uid; // setting user id in the request object
            
            // console.log(req.body.username);
            console.log(tokenVerify.uid)
            console.log(tokenVerify)
            console.log(`no ${tokenVerify.phone_number}`)
        }catch(e){
            /**
             * can be thrown due to expired/ invalid token
             */
            console.log("token verification failed" + e)
            throw new HttpException("Bad request" , HttpStatus.BAD_REQUEST)
            
        }
        

    }


}