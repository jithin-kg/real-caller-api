import { ContactAdderssWithHashedNumber } from "src/multiple-number-search/contactAddressWithHashedNumDTO";
import { RehashedItemWithOldHash } from "src/multiple-number-search/RehashedItemwithOldHash";
import { NumberTransformService } from "./numbertransform.service";

/**
 * A helper class which takes request body phone number and rehash it with by adding secret
 */
export class Hashelper{

    constructor(private numberTranformService: NumberTransformService){}
    /**
     * This function get the request body containing array of phone number with 
     * its equivalent hash result from client and rehash the existing 
     * hash by adding secret and add necessory information such as 
     * carrier info and phone number geo location info
     * @param arrayOfHahsedNums : array of phone numbers with equivalent hash 
     * value of phone number  
     * 
     */
    ContactAdderssWithHashedNumber
    async  rehashArrayOfItems(arrayOfHahsedNums:
         ContactAdderssWithHashedNumber[]): Promise<RehashedItemWithOldHash[]> {
            let resultArray:RehashedItemWithOldHash[] = []
    
        return new Promise(async (resolve, rejects)=>{
            for await(const hashedNum of arrayOfHahsedNums){
                try{
                   let rehasehdNum = await  this.numberTranformService.tranforNum(hashedNum.contactAddressHashed)
                   const obj = new RehashedItemWithOldHash()
                   obj.phoneNumber = hashedNum.contactAddressString;
                   obj.newHash = rehasehdNum
                    obj.firstName = "sample"
                    obj.spamCount = 0

                   console.log(rehasehdNum) 
                   if(rehasehdNum !=null){
                      
                        resultArray.push(obj)
                   }
                }catch(e){
                    console.log(`rehashArrayItems ${e}`)
                    rejects(e)
                }
            }
            resolve(resultArray)
        } ) 
        }
}