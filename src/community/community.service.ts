import { Inject, Injectable } from "@nestjs/common";
import { Db } from "mongodb";
import { CollectionNames } from "src/db/collection.names";
import { DatabaseModule } from "src/db/Database.Module";
import { GenericServiceResponseItem } from "src/utils/Generic.ServiceResponseItem";
import { NumberTransformService } from "src/utils/numbertransform.service";
import { processHelper } from "src/utils/processHelper";
import { NameSuggestionDto } from "./dto/suggestedName.dto";
import { UserAndDownvotedNumsDoc } from "./dto/userAndDownvotedNums.doc";
import { UserAndUpvotedNumsDoc } from "./dto/userAndUpvotedNums.doc copy";

@Injectable()
export class CommunityService {
    
    // constructor(@InjectModel("User") private readonly userModel: Model<User>) { }
    constructor(@Inject(DatabaseModule.DATABASE_CONNECTION) private db: Db,
        private numberTransformService: NumberTransformService
    ) { }

    async saveNameSuggetions(body : NameSuggestionDto) : Promise<GenericServiceResponseItem<any>>{

       try{
        let hashedNum = await this.numberTransformService.tranforNum(body.number)
        let huid = body.tokenData.huid
        let query = {
            _id: hashedNum
        }
        let update = {
            _id: hashedNum,
            [huid] : body.name
        }
        let options  = {
            upsert: true
        }
        
        await this.db.collection(CollectionNames.SUGGEESTED_NAMES_DOC).updateOne(query, {$set:update}, options)
       
        return GenericServiceResponseItem.returnGoodResponse("")
    }catch(e){
        console.log("saveNameSuggetions exception", e)
        return GenericServiceResponseItem.returnServerErrRes()

       }
    }

    async downvoteName(body: NameSuggestionDto) : Promise<GenericServiceResponseItem<string>> {
        try{
            const userDownvotedNameAndNums =  await this.db.collection(CollectionNames.USER_AND_DOWNVOTED_NUMS).findOne({_id: body.tokenData.huid}) as UserAndDownvotedNumsDoc
            //check if the user upvoted name for the number
            const rehasehdNum = await this.numberTransformService.tranforNum(body.number)
            
            if( userDownvotedNameAndNums == null || !(rehasehdNum in userDownvotedNameAndNums)){
                //key does not exist, user not upvoted for this number
                const query = {
                    _id: body.tokenData.huid
                }
                const updateOp = {
                    $set: {
                        [rehasehdNum]: "1",
                    }
                }
                const options = {
                    upsert:true
                }

                const queryCron = {
                    _id: rehasehdNum
                }
                const updateOpCron = {
                    $addToSet: {
                        "names":body.name
                    }
                }
                 const optionsCron = {
                     upsert:true
                 }
                const procesList = [
                    this.db.collection(CollectionNames.USER_AND_DOWNVOTED_NUMS).updateOne(query, updateOp, options),
                this.db.collection(CollectionNames.DOWNVOTED_NUMBER_FOR_CRON).updateOne(queryCron, updateOpCron, optionsCron)
            ]
              const [res1, res2] =  await processHelper.doParallelProcess(procesList)
           
            }
          
            return GenericServiceResponseItem.returnGoodResponse("")

        }catch(e){
            console.log("upvoteName exception ", e)
            return GenericServiceResponseItem.returnServerErrRes()
        }
       }


       async upvoteName(body: NameSuggestionDto) : Promise<GenericServiceResponseItem<string>> {
        try{
            const userUpvotedNameAndNums =  await this.db.collection(CollectionNames.USER_AND_UPVOTED_NUMS).findOne({_id: body.tokenData.huid}) as UserAndUpvotedNumsDoc
            //check if the user upvoted name for the number
            const rehasehdNum = await this.numberTransformService.tranforNum(body.number)
            
            if( userUpvotedNameAndNums == null || !(rehasehdNum in userUpvotedNameAndNums)){
                //key does not exist, user not upvoted for this number
                const query = {
                    _id: body.tokenData.huid
                }
                const updateOp = {
                    $set: {
                        [rehasehdNum]: "1",
                    }
                }
                const options = {
                    upsert:true
                }

                const queryCron = {
                    _id: rehasehdNum
                }
                const updateOpCron = {
                    $addToSet: {
                        "names":body.name
                    }
                }
                 const optionsCron = {
                     upsert:true
                 }
                const procesList = [
                    this.db.collection(CollectionNames.USER_AND_UPVOTED_NUMS).updateOne(query, updateOp, options),
                this.db.collection(CollectionNames.UPVOTED_NUMBER_FOR_CRON).updateOne(queryCron, updateOpCron, optionsCron)
            ]
              const [res1, res2] =  await processHelper.doParallelProcess(procesList)
           
            }
          
            return GenericServiceResponseItem.returnGoodResponse("")

        }catch(e){
            console.log("upvoteName exception ", e)
            return GenericServiceResponseItem.returnServerErrRes()
        }
       }

}