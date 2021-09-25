import { Injectable, Inject, HttpException, HttpStatus } from "@nestjs/common";
import { Collection, Model } from 'mongoose'
import { Db } from "mongodb";
import { type } from "os";
import { CollectionNames } from "src/db/collection.names";
import * as bcryptjs from 'bcryptjs';
import {SearchResponseItem} from "./SearchResponseItem";
import {GenericServiceResponseItem} from "../utils/Generic.ServiceResponseItem";
import {Constants} from "../calls/Constatns";
import {ManualSearchDto} from "./manualSearch.dto";
import { HttpMessage } from "src/utils/Http-message.enum";
import { DatabaseModule } from "src/db/Database.Module";
import { ContactDocument } from "src/contactManage/dto/contactDocument";
import { NumberTransformService } from "src/utils/numbertransform.service";
import { SpammerTypeVAlues, SpammerTypeVAluesNum } from "src/spam/dto/spam.type";


@Injectable()
export class SearchService {
   
     private collection;
    // constructor(@InjectModel("User") private readonly userModel: Model<User>) { }
    constructor(@Inject(DatabaseModule.DATABASE_CONNECTION) private db:Db,
            private readonly numberTransformService : NumberTransformService
    ) {
         this.collection = this.db.collection( CollectionNames.CONTACTS_OF_COLLECTION
            );
    }



    async search(pno:string): Promise<GenericServiceResponseItem<SearchResponseItem>> {
    
        let hashedPhone = await this.numberTransformService.tranforNum(pno)
        let res = [];
            try{
                let result:SearchResponseItem = await this.getContacts(hashedPhone, pno);
                if(result!=undefined){
                    return GenericServiceResponseItem.returnGoodResponse(result)
                }else {
                    return  GenericServiceResponseItem.returnGoodResponse(null, HttpStatus.NO_CONTENT)
                }
            }catch(e){
                console.log(e);
                return GenericServiceResponseItem.returnServerErrRes() 
            }
    
    }

    /**
     *
     * @param pno rehashed number using secret key
     * returns null/undefined if pno not found in database
     * else returns SearchREsponseItem
     */
   async getContacts(pno, reqPhoneNumber) : Promise<SearchResponseItem|null>{
        return new Promise(async (resolve, reject)=>{
            // this.collection.find({phoneNumber:new RegExp(pno)})
          try{
              const res =  await  this.collection.findOne({_id:pno}) as ContactDocument
              let responseitem:SearchResponseItem 
              if(res!=null){
                    responseitem = new SearchResponseItem()
                    responseitem.firstName = res.firstName ?? ""
                    responseitem.lastName = res.lastName ?? ""
                    responseitem.carrier = res.carrier?? ""
                    responseitem.location = res.location?? ""
                    responseitem.lineType = res.lineType?? ""
                    responseitem.country = res.country?? ""
                    responseitem.spamCount = res.spamCount?? 0
                    responseitem.thumbnailImg = res.image??"" 
                    responseitem.nameInPhoneBook = res.nameInPhoneBook??""
                    responseitem.hUid = res.hUid??"";
                    responseitem.email = res.email??"";
                    responseitem.avatarGoogle = res.avatarGoogle??"";
                    responseitem.bio = res.bio??"";
                    responseitem.isInfoFoundInDb = Constants.INFO_FOUND_ID_DB;
                    responseitem.isVerifiedUser = res.isVerifiedUser
                    responseitem.clientHashedNum = reqPhoneNumber
                    if(res.spamerType != null || res.spamerType != undefined){
                         var big = res.spamerType.business
                        responseitem.spamerType = SpammerTypeVAluesNum.SPAMMER_TYPE_BUSINESS
                    if(res.spamerType.notSpecific > big){
                        big = res.spamerType.notSpecific
                        responseitem.spamerType = SpammerTypeVAluesNum.SPAMMER_TYPE_NOT_SPECIFIC

                    }
                     if(res.spamerType.person > big){
                        big = res.spamerType.person
                    responseitem.spamerType = SpammerTypeVAluesNum.SPAMMER_TYPE_PEERSON

                    }

                    if(res.spamerType.sales > big){
                        big = res.spamerType.sales
                    responseitem.spamerType = SpammerTypeVAluesNum.SPAMMER_TYPE_SALES

                    }
                    if(res.spamerType.scam > big){
                        big = res.spamerType.scam
                    responseitem.spamerType = SpammerTypeVAluesNum.SPAMMER_TYPE_SCAM

                    }
                    }

                    

              }
              resolve(responseitem)
          }catch(e){
              console.error(`Error while searching for number searchservice ${e}`)
              reject(e)
          }

        //
        // .limit(1)
        //     .toArray((err, data)=>{
        //          if(err){
        //              console.log(err)
        //              reject(err);
        //             //  throw new HttpException('Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
        //          }else{
        //             console.log("searchService -------------> size " + data.length)
        //              resolve(data);
        //
        //          }
        //      });
        })
    }

    async manualSearch(searchDto: ManualSearchDto) {


        await this.getPreparedNumber(searchDto)

        return undefined;
    }
    async getPreparedNumber(searchDto: ManualSearchDto) {

    }
}

// 1QZNour+mmFYF/F3rohGc7gs3vQYAsmL2us9MURT40M=
// 1QZNour+mmFYF/F3rohGc7gs3vQYAsmL2us9MURT40M=