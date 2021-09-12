import { Inject, Injectable } from "@nestjs/common";
import { Db } from "mongodb";
import { CollectionNames } from "src/db/collection.names";
import { DatabaseModule } from "src/db/Database.Module";
import { GenericServiceResponseItem } from "src/utils/Generic.ServiceResponseItem";
import { NumberTransformService } from "src/utils/numbertransform.service";
import { NameSuggestionDto } from "./dto/suggestedName.dto";

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

}