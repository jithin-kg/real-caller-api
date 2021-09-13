
// Collection holding 
    /**
     * 
     *  _id : "2fd5c8738fb5591e6ae8f9def7b41b4cc0042cad" // a rehasehd phone number in contactsOfUser Collection
     * //given below -> key is the uploader _id , and value is the suggested name (which was in their contact)
     * "87787be49f6f90ed4a52a929dc1894a069e39af0": "jithin",
     * "97787be49f6f90ed4a52a929dc1894a069e39ab1": "appu",
     */
export interface PhoneNumNamAndUploaderDoc<T> {
    // pbulic constructor(public _id:string,public [key:string]: string ){}
    // _id:string;
    [key:string]: T;

}
export class NameAndUpvotes {
    nameInPhoneBook:string="";
    upVoteCount: number = 0
    downVoteCount: number = 0;
}
//refer accepted answer https://stackoverflow.com/questions/45258216/property-is-not-assignable-to-string-index-in-interface
export type IdType<T> = PhoneNumNamAndUploaderDoc<T> & {
    _id:string
}

// export class PhoneNumNameAssocHelper {
//     static getPrepared
// }