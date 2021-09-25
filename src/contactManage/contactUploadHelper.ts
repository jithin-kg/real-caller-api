import { Indiaprefixlocationmaps } from "src/carrierService/carrier.info.schema";
import { ContactProcessingItem } from "./dto/contactProcessingItem";
import { ContactRehashedItemWithOldHash } from "./dto/contactRehashedItemwithOldHash";


/**
 * Class containing static methods(helper functions) to be called from 
 *  contactManage.service.ts
 */
export class ContactUploadHelper {

    static  prepareContactReturnObj(cntct: ContactProcessingItem): ContactRehashedItemWithOldHash {
        
        let contactReturnObj = new ContactRehashedItemWithOldHash();
        contactReturnObj.phoneNumber = cntct.prevHash
        contactReturnObj.carrier = cntct.carrier;
        contactReturnObj.country = cntct.country
        contactReturnObj.lineType = cntct.lineType
        contactReturnObj.location = cntct.location
        contactReturnObj.spamCount = cntct.spamCount
        contactReturnObj.nameInPhoneBook = cntct.nameInPhoneBook
        if (cntct.isRegistered) {
            contactReturnObj.isRegistered = cntct.isRegistered
            contactReturnObj.firstName = cntct.firstName
            contactReturnObj.lastName = cntct.lastName
            contactReturnObj.bio = cntct.bio
            contactReturnObj.hUid = cntct.hUid
            contactReturnObj.email = cntct.email
            contactReturnObj.avatarGoogle = cntct.avatarGoogle
        }
        contactReturnObj.isVerifiedUser = cntct.isVerifiedUser
        return contactReturnObj;

    }

    static async getCarrierInfo( countryCode: string, countryISO: string): Promise<Indiaprefixlocationmaps> {

        let info: Indiaprefixlocationmaps = new Indiaprefixlocationmaps();
        return info;
    }

}