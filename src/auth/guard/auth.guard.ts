import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';


import { Observable } from 'rxjs';
import { Firebaseconfig } from '../firebase.config';

/**
 * 
 * Guard for authentication authorization token without
 * huid, use this auth guard for where user not signed in to hashcaller 
 * this is used for routes with user token without huid
 */

@Injectable()
export class AuthGuard implements CanActivate {

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {

    const request = context.switchToHttp().getRequest()
    // request.
    request.body.tokenData = null;
    if (!request.headers.authorization) {
      return false;
    }
    const accessToken = request.header('Authorization').replace('Bearer', '').trim()
    if (!accessToken) {
      return false;
    }
    const tokenData = await Firebaseconfig.validate(accessToken, request)
    if(tokenData){
      request.body.tokenData = tokenData
      return true;
    }
    return false;
    // return true;
  }
  
}

