// import { Injectable, NestMiddleware } from '@nestjs/common';
// import { Request, Response, NextFunction } from 'express';
// import * as toobusy from 'toobusy-js'
// import * as hpp from 'hpp';
// // https://cheatsheetseries.owasp.org/cheatsheets/Nodejs_Security_Cheat_Sheet.html
// @Injectable()
// export class TooBusyMiddleware implements NestMiddleware {
//   use(req: Request, res: Response, next: NextFunction) {
//     hpp();//Prevent HTTP Parameter Pollution
//     if(toobusy()){
//         res.send("server Too busy")
//     }else{
//         next();

//     }
//   }
// }

