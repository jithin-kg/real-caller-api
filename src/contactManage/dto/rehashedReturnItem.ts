import { ContactDocument } from "./contactDocument";
import { ContactRehashedItemWithOldHash } from "./contactRehashedItemwithOldHash";
import { IdType, NameAndUpvotes, PhoneNumNamAndUploaderDoc } from "./phoneNumNameUploaderAssocDoc";

export class RehashedReturnItem { 
    constructor(
        public contactsListForDb:ContactDocument[],
        public contactsListForRespones: ContactRehashedItemWithOldHash[],
        public phoneNumUploaderAssociation:  IdType<NameAndUpvotes>[]
        ){}
}