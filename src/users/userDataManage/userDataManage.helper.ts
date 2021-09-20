import { Db } from 'mongodb';
import { do_AES_decryption } from 'src/contactManage/myContacts/saveContactsHelper';
import { CollectionNames } from 'src/db/collection.names';
import { ReqContactDTO } from './../../contactManage/myContacts/reqContactDTO';
export class UserDataManageHelper {
    /**
     * @param hUid id for identify user
     * @param db db object
     * 
     * 1 retrieve data from collection
     * 
     * @returns 
     * 2 return array of contacts [ { name:string, hashedPhoneNumber:string } ]
     */
    static fetchSavedContactsOfUser(hUid: string, db: Db) {
        return new Promise(async (resolve, reject) => {
            try {
                const query = { _id: hUid };
                const result_enc =
                    await db.collection(CollectionNames.MY_CONTACTS).findOne(query)
                // console.log(`savedContactsOfuser ${hUid}: `, result_enc);
                if (result_enc && result_enc.contacts) {
                    console.time()
                    let decryptedData = await do_AES_decryption(result_enc.contacts)
                    console.log('decrypted contacts list  ',decryptedData.length)
                    console.timeEnd()
                    resolve(decryptedData)
                } else {
                    resolve([])
                }
            } catch (error) {
                console.log("fetchSavedContactsOfUser_error : ", error);
                reject(error)
            }
        })
    }

    /**
     * 
     * @param hUid id for identify user
     * @param db db object
     * @returns 
     * object of user informations 
     */
    static getUserInformationByhUid(hUid: string, db: Db):Promise<any> {
        return new Promise(async (resolve, reject) => {
            try {
                const query = { hUid: hUid };
                const result =
                    await db.collection(CollectionNames.USERS_COLLECTION).findOne(query)
                if (result)
                    resolve(result);
                else resolve(null)
            } catch (error) {
                console.log("getUserInformationByhUid : ", error);
                reject(error)
            }
        })
    }

    /**
     * @param valuesList an object which contains the db response;
     */
    static prepareData(valuesList: any): UserDataManageResponse {
        let result = new UserDataManageResponse(valuesList);
        return result;
    }
}




//class for response preparation
/**
 * Destructuring inside constructor help us to pass direct object inside constructor
 * 
 * let userData = { firstName: "sarath", lastName: "P", image: null, _id: "xyz" }
    let contacts = [{
            name: "sam", hashedPhoneNumber: "98983782"
                    }, {
            name: "ooh", hashedPhoneNumber: "9823798723"
                    }]

    let result = new UserDataManageResponse({ ...userData, contacts: contacts });
    console.log(result) //{ "firstName": "sarath","lastName": "P","image": null,"contacts": 
        [{"name": "sam","hashedPhoneNumber": "98983782"},{"name": "ooh","hashedPhoneNumber": "9823798723"}]
                        } 
 * 
 */
class UserDataManageResponse {
    firstName: string = "";
    lastName: string = "";
    image?: string | null = "";
    contacts: ReqContactDTO[];
    
    constructor({
        firstName, lastName,
        image, contacts,
    }: UserDataManageResponse) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.image = image;
        this.contacts = contacts
    }
}