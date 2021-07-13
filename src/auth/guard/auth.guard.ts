import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';


import { Observable } from 'rxjs';
import { Firebaseconfig } from '../firebase.config';

/**
 * Guard for authentication authorization token without
 * huid, use this auth guard for where user not signed in to hashcaller 
 * 
 * this is used for routes with user token without huid
 */
@Injectable()
export class AuthGuard implements CanActivate {

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {

    const request = context.switchToHttp().getRequest()
    // request.
    if (!request.headers.authorization) {
      return false;
    }
    const accessToken = request.header('Authorization').replace('Bearer', '').trim()
    if (!accessToken) {
      return false;
    }
    const isvalid = await Firebaseconfig.validate(accessToken, request)
    
    return isvalid;
    // return true;
  }
  
}

