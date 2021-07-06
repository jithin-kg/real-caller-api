import { Indiaprefixlocationmaps } from "src/carrierService/carrier.info.schema";
import { ContactProcessingItem } from "./contactProcessingItem";
import { ContactRehashedItemWithOldHash } from "./contactRehashedItemwithOldHash";


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
        contactReturnObj.firstName = cntct.firstName
        if (cntct.isRegistered) {
            contactReturnObj.isRegistered = cntct.isRegistered
            contactReturnObj.hUname = cntct.hUname
        }
        return contactReturnObj;

    }

    static async getCarrierInfo( countryCode: number, countryISO: string): Promise<Indiaprefixlocationmaps> {

        let info: Indiaprefixlocationmaps = new Indiaprefixlocationmaps();
        return info;
    }

}