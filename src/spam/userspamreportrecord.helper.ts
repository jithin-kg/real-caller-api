import { UserSpamReportRecord } from "./spam.dto";

export class UserSpamReportRecordHelper {
    /**
     * method to mongodb result (contactsOfUser) to ContactDocument
     * @param dbResult result frojm datbase 
     * @returns 
     */
     static dbResToSpamRecordClass(dbResult:any): UserSpamReportRecord{
        let spamReportedDoc = new UserSpamReportRecord()
        spamReportedDoc.spammerType = (dbResult as any).spammerType
        spamReportedDoc.hUid = (dbResult as any).hUid
        spamReportedDoc.uid = (dbResult as any).uid
        spamReportedDoc.phoneNumber = (dbResult as any).phoneNumber
        return spamReportedDoc;
    }
}