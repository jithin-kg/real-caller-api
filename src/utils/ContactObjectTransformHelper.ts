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
    static setCarrierInfoPromiseType(contactWithCarrierInfo: ContactProcessingItem, carrierInfo: Indiaprefixlocationmaps) {
        contactWithCarrierInfo.carrier = carrierInfo.carrier
        contactWithCarrierInfo.lineType = carrierInfo.lineType
        contactWithCarrierInfo.location = carrierInfo.location
    }
    static  setCarrierInfo(contactWithCarrierInfo: ContactProcessingItem, carrierInfo: Indiaprefixlocationmaps) {
        try{
            if(carrierInfo!=null) {
                contactWithCarrierInfo.carrier = carrierInfo.carrier ?? "";
                contactWithCarrierInfo.lineType = carrierInfo.lineType ??"";
                contactWithCarrierInfo.location = carrierInfo.location ?? "";
                contactWithCarrierInfo.country = carrierInfo.country ?? "";
            }
           
        }catch(e){

        }
        
        
       
    }
}