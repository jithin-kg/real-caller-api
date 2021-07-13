import { Injectable, NestMiddleware, HttpException, HttpStatus } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";

import * as firebaseAdmin from 'firebase-admin';
import * as firebaseServiceAccount from './hashcaller2-firebase-adminsdk-7uc9d-1b78a345bf.json';
import { async } from "rxjs";
import { DH_UNABLE_TO_CHECK_GENERATOR } from "constants";
import {UserIdDTO} from "../utils/UserId.DTO";
import {NumberTransformService} from "../utils/numbertransform.service";
import * as url from 'url'
import { resolve } from "path";
import { rejects } from "assert";
import { HAccessTokenData } from "./accessToken.dto";
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

        // firebaseAdmin.initializeApp({
        //     credential: firebaseAdmin.credential.cert(params)
        // })
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

    static async getTokenDataFromHeader(req:any): Promise<HAccessTokenData> {
    
        return new Promise(async (resolve, reject)=>{
         try{
           const token:string = req.header('Authorization').replace('Bearer', '').trim()
         const tokenVerify = await firebaseAdmin.auth().verifyIdToken(token)
         const user = new  HAccessTokenData()
         user.huid = tokenVerify.hUserId;
         user.uid  = tokenVerify.uid;
         resolve(user)
         }catch(e){
             reject(e)
         }
        })
 }

    static createCustomToken(uid:string, hashedNum:string):Promise<string>{
        return new Promise(async (resolve, reject)=>{
            try{
                const hUserId = await this.numberTransformService.tranforNum(hashedNum)
                firebaseAdmin.auth()
                    .createCustomToken(uid, {
                        hUserId:hUserId
                    }).then((customtoken)=>{
                    console.log(`custom token is ${customtoken}`)
                    resolve(customtoken)

                    return ;
                }).catch((e)=>{
                    console.error(`error while creating custom token`)
                    reject(`error while creating custom token ${e}`)
                    return ;
                })

            }catch (e){
                reject(`error while creating custom token ${e}`)
            }
        })
    }
    /**
     * This function is only called when enter otp
     * then with that token client request for the phone number
     *
     * @param uid
     */
    static getPhoneNumberFromToken(header:any):Promise<string> {
        return new Promise(async (resolve)=>{
            try{
                // const token:string = header.replace('Bearer', '').trim()
                const token:string = header.authorization
                const tokenVerify = await firebaseAdmin.auth().verifyIdToken(token)
                const phoneNumber = tokenVerify.phone_number;
                console.log(`phone number in token ${ tokenVerify.phone_number}`)
                if(phoneNumber){
                    resolve(phoneNumber)
                }else {
                    resolve(null)
                }
                
            }catch(e){
                resolve(null)
            }
        })
    }
    /**
     * 
     * @param uid:string,  firebase uid passed in from mongodb
     * when an existing user tries to login a new uid gets created in firebase, so we need to remove 
     * the previous uid of the user that we have stored in database.
     * deleteUser(uid) removes the user from firebase
     */
    static async removeUserById(uid:string):Promise<void>{
        return new Promise(async (res, rej)=> {
            try {
                await firebaseAdmin.auth().deleteUser(uid)
                res()
                return ;
            }catch (e){
                //to
                rej()
                return;
            }
        })
    }

    static async desableUser(uid:string) {
        return new Promise(async (res, rej)=> {
            try {
                await  firebaseAdmin.auth().updateUser(uid, {
                    disabled: true
                })
                Promise.resolve()
            }catch (e){
                Promise.reject()
                console.log(`Error while desabling user`)
            }
        })
       
    }
    static async removeUserPhoneNumberFromFirebase(uid:string):Promise<any>{

        return new Promise(async (resolve)=> {
            Promise.resolve().then(async res=> {
                try {
                    // const uid = await this.getUserId(req)
                    await  firebaseAdmin.auth().updateUser(uid, {
                        phoneNumber:null
                    })
                    resolve("done")
                }catch (e){
                    //todo 
                    resolve("")
                    console.log(`Error while removeUserPhoneNumberFromFirebase ${e}`)
                 //    reject(e)
                }
            })
           
        })

    }
    async use(req: Request, res: Response, next: NextFunction) {
        try{
            if(req.baseUrl === '/user/verifyEmail'){
                next()
            }else {
                const token:string = req.header('Authorization').replace('Bearer', '').trim()
                await this.validateRequest(req, token , next); 
                // next()
                // throw new HttpException("Bad request" , HttpStatus.BAD_REQUEST)
            }

           
        }
        catch(e){
            throw new HttpException("Bad request" , HttpStatus.BAD_REQUEST)
        }
        //  console.log(req.header('Authorization')) ;  
       
    }
     async validateRequest(req: Request, token, next:NextFunction) {
        try{
            console.log("----token:",token)
            const tokenVerify = await firebaseAdmin.auth().verifyIdToken(token)
             //her I can get phone number from tokenVerify.phone_number
            if (tokenVerify.admin == true) {
                // console.log("Admin");
            } else {
                // console.log("Not admin");
            }
            //todo when handling get request body does not work
            req.body.uid = tokenVerify.uid; // setting user id in the request object
            
            next()
            // console.log(req.body.username);
            // console.log(tokenVerify.uid)
            // console.log(tokenVerify)
            // console.log(`no ${tokenVerify.phone_number}`)
        }catch(e){
            /**
             * can be thrown due to expired/ invalid token
             */
            console.log("token verification failed" + e)
            throw new HttpException("Bad request" , HttpStatus.BAD_REQUEST)
            
        }
        

    }


}