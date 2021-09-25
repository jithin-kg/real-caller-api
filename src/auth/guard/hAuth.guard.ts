import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';


import { Observable } from 'rxjs';
import { Firebaseconfig } from '../firebase.config';

/**
 * Guard for  authenticating authorization token
 * having hUid
 * HAuthguard is used for routes having user custom token with huid is added.
 */
@Injectable()
export class HAuthGuard implements CanActivate {

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
    const tokenData = await Firebaseconfig.validateHuser(accessToken, request)
    if(tokenData){
      request.body.tokenData = tokenData
      console.log(request.body);
      return true
    }
    return false;
    // return true;
  }
  
}

