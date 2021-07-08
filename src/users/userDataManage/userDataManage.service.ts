import { Inject, Injectable } from '@nestjs/common';
import { Db } from 'mongodb';
import { FirebaseMiddleware } from 'src/auth/firebase.middleware';
import { DatabaseModule } from 'src/db/Database.Module';
import { GenericServiceResponseItem } from 'src/utils/Generic.ServiceResponseItem';
import { processHelper } from './../../utils/processHelper';
import { UserDataManageHelper } from './userDataManage.helper';
import { UserDataManageResponseDTO } from './userDataResponseDTO';
@Injectable()
export class UserDataManageService {
    constructor(@Inject(DatabaseModule.DATABASE_CONNECTION) private db: Db) { }
    /**
     * 
     * @param req 
     * this function accept req from http request passed from controller
     * extract hUid from req.authorization.token by used firebaseMiddleware function
     * then we can retrieve user informations and saved contacts from collections by use this hUid
     * 
     * process
     * 1) get huid from token
     * 2) fetch data from userinfo
     * 3) fetch data from myContacts
     * 4) UserDataManageHelper.prepareData help to remove unwanted data from db response
     * 5) return
     * @returns
     * return response by use generic function (GenericServiceResponseItem<UserDataManageResponseDTO>)
     */
    getMyData(req: any): Promise<GenericServiceResponseItem<UserDataManageResponseDTO>> {
        return new Promise(async resolve => {
            try {
                let extractedToken = await FirebaseMiddleware.getUserId(req)
                let hUid = extractedToken.hUserId;
                if (hUid) {
                    let _proccessList = [
                        UserDataManageHelper.fetchSavedContactsOfUser(hUid, this.db),   //0th position
                        UserDataManageHelper.getUserInformationByhUid(hUid, this.db)    //1st position
                    ];
                    let result = await processHelper.doParallelProcess(_proccessList);
                    const fetchSavedContactsOfUser_POSITION = 0;
                    const getUserInformationByhUid_POSITION = 1;

                    let rejectedProcessList = result.filter(({ status }) => status === processHelper.REJECTED);
                    if (rejectedProcessList.length > 0) {
                        console.log("rejectedProcessList: ", rejectedProcessList)
                        resolve(GenericServiceResponseItem.returnBadRequestResponse())
                        return;
                    } else {
                        // console.log("result", result);
                        let savedContacts = result[fetchSavedContactsOfUser_POSITION]?.value;
                        let userInformation = result[getUserInformationByhUid_POSITION]?.value;
                        let dataForPrepare = { contacts: savedContacts, ...userInformation }
                        let response = UserDataManageHelper.prepareData(dataForPrepare);
                        resolve(GenericServiceResponseItem.returnGoodResponse(response));
                        return;
                    }
                } else {
                    console.log("hUid not found")
                    resolve(GenericServiceResponseItem.returnBadRequestResponse())
                    return;
                }

            } catch (error) {
                console.log("getMyData()--catch : ", error)
                resolve(GenericServiceResponseItem.returnServerErrRes())
                return;
            }
        })
    }
}