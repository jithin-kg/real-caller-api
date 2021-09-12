export class CollectionNames {
    static CONTACTS_COLLECTION: string = "contactsNew";
    static CONTACTS_OF_COLLECTION: string = "contactsOfUser";
    static USERS_COLLECTION: string = "users";
    static MY_CONTACTS: string = "myContacts";
    
    /**
     * document containing user id and contacts uploaded by user
     * _id : userId,
     * contacts: ["1237uidsyfsdiof","dgdlf234" ]
     * refer UserUploadedContacts
     */
    static REHASHED_NUMS_OF_USER: string = "rehashedNumbersOfUser";
    

    /**
     * a document contains a phone number and all the users list which 
     * are the users uploaded the same phone number 
     *  _id : "2fd5c8738fb5591e6ae8f9def7b41b4cc0042cad" // a rehasehd phone number in contactsOfUser Collection
     * //given below -> key is the uploader _id , and value is the suggested name (which was in their contact)
     * "87787be49f6f90ed4a52a929dc1894a069e39af0": "jithin",
     * "97787be49f6f90ed4a52a929dc1894a069e39ab1": "appu",
     * schema -> PhoneNumNamAndUploaderDoc
     */

    static PHONE_NUM_AND_NAME_ASSOCIATION = "phoneNumNameUploderAssociation"

   //Collection containing delete my data request user ids .
   static DELETE_MY_DATA_REQUESTS = "deleteMyDataRequests"

   static SUGGEESTED_NAMES_DOC = "suggestedNamesForNumber"

   /**
    * this document is helpfull to avoid "double spening problem", ie 
    * a user upvoting a number more than once
    * document of, a user upvoted a name is correct for a  displayed number
    * _id: hUid,
    * [phoneNumber]:1
    *   refer UserAndUpvotedNumsDoc
    */
   static USER_AND_UPVOTED_NUMS = "userAndUpvotedNumbers"
   static USER_AND_DOWNVOTED_NUMS = "userAndDownvotedNumbers"

   /**
    * Document containing a phone number and set of names
    * _id : phonenumber hash
    * names: [] // set of names containing names
    * refer UpvotedNumsCronDoc 
    */
   static UPVOTED_NUMBER_FOR_CRON = "userUpvotedNumberCron"

   

   /**
    * Document containing a phone number and set of names
    * _id : phonenumber hash
    * names: [] // set of names containing names
    * refer DownvotedNumsCronDoc 
    */
    static DOWNVOTED_NUMBER_FOR_CRON = "userDownvotedNumberCron"

   

}

