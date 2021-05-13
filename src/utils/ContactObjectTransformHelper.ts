import {ContactProcessingItem} from "../contact/contactProcessingItem";
import {ContactDocument} from "../contact/contactDocument";
import {Indiaprefixlocationmaps} from "../carrierService/carrier.info.schema";

export class ContactObjectTransformHelper {
    /**
     * function to get instance object of type ContactDocument, which is the type
     * of documnet to be inserted into db
     * @param image user, thumbnail image if exists
     * @param cntct
     */
    static   prepareContactDocForInsertingIntoDb(cntct: ContactProcessingItem, image:Buffer = null): ContactDocument {
        let contactDoc = new ContactDocument();
        contactDoc._id = cntct.hashedPhoneNumber
        contactDoc.carrier = cntct.carrier;
        contactDoc.country = cntct.country
        contactDoc.lineType = cntct.lineType
        contactDoc.location = cntct.location
        contactDoc.spamCount = cntct.spamCount
        contactDoc.firstName = cntct.firstName;
        contactDoc.lastName = cntct.lastName;
        if(image!=null){
            contactDoc.image = image.toString("base64")
        }
        return contactDoc;
    }

    /**
     *
     * @param contactWithCarrierInfo
     * @param carrierInfo PromiseFulfilledResult
     */
    static setCarrierInfoPromiseType(contactWithCarrierInfo: ContactProcessingItem, carrierInfo: PromiseFulfilledResult<Indiaprefixlocationmaps>) {
        contactWithCarrierInfo.carrier = carrierInfo.value.carrier.trim();
        contactWithCarrierInfo.lineType = carrierInfo.value.lineType.trim()
        contactWithCarrierInfo.location = carrierInfo.value.location.trim();
    }
    static  setCarrierInfo(contactWithCarrierInfo: ContactProcessingItem, carrierInfo: Indiaprefixlocationmaps) {
        if(carrierInfo!=null){
            contactWithCarrierInfo.carrier = carrierInfo.carrier.trim();
            contactWithCarrierInfo.lineType = carrierInfo.lineType.trim()
            contactWithCarrierInfo.location = carrierInfo.location.trim();
            contactWithCarrierInfo.country = carrierInfo.country.trim()
        }
       
    }
}