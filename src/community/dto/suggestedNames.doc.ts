export class SuggestedNameDoc {
    /**
     *
     * Here key will be user Id and value will be the suggested name
     * eg: klshjdfksjdfh213: "sam"
     * and id will be the phone number hashed
     * 
     * eg: 
     *  {
     *      _id: 2fd5c8738fb5591e6ae8f9def7b41b4cc0042cad,
     *      87787be49f6f90ed4a52a929dc1894a069e39af0 : "sam"
     *  }
     * here '2fd5c8738fb5591e6ae8f9def7b41b4cc0042cad' is the phone number and 
     * '87787be49f6f90ed4a52a929dc1894a069e39af0' user (hUid) suggested 'sam' as the name for the number
     */
    _id:string
    [key:string] : string
}