import { ContactDocument } from "src/contact/contactDocument";
import { ContactRehashedItemWithOldHash } from "./contactRehashedItemwithOldHash";

export class RehashedReturnItem { 
    constructor(
        public contactsListForDb:ContactDocument[],
        public contactsListForRespones: ContactRehashedItemWithOldHash[]
        ){}
}