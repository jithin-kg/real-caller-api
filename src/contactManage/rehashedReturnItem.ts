import { ContactDocument } from "./contactDocument";
import { ContactRehashedItemWithOldHash } from "./contactRehashedItemwithOldHash";

export class RehashedReturnItem { 
    constructor(
        public contactsListForDb:ContactDocument[],
        public contactsListForRespones: ContactRehashedItemWithOldHash[]
        ){}
}