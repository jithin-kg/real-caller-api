import { Inject, Injectable } from "@nestjs/common";
import { DatabaseModule } from "src/db/Database.Module";
import { Db } from "mongodb";
import { PriorityReqDto, PriorityResDto } from "./priority.dto";
import { CollectionNames } from "src/db/collection.names";
import { VersionCodeAndPriorityDoc } from "./versioncodepriority.doc";
import { GenericServiceResponseItem } from "src/utils/Generic.ServiceResponseItem";
@Injectable()
export class SystemService {
    constructor(@Inject(DatabaseModule.DATABASE_CONNECTION) private db:Db) {} 
   
    async getPriorityByVersionCode(body: PriorityReqDto) : Promise<GenericServiceResponseItem<PriorityResDto>>{
        try{
           const doc =  await this.db.collection(CollectionNames.STORE_VERSION_CODE_AND_PRIORITY).findOne({_id:body.versionCode} ) as VersionCodeAndPriorityDoc
           
           const result = new PriorityResDto()
           result.versionCode = body.versionCode
           if(doc)
            result.priority = doc.priority
           
           return  GenericServiceResponseItem.returnGoodResponse(result)

        }catch(e){
            console.log('getPriorityByVersionCode ',e)
            return GenericServiceResponseItem.returnServerErrRes()
        }
    }

    async insertDummy() {
        
            for(let i =30; i< 70; i++){
                const insertDoc = new VersionCodeAndPriorityDoc()
                insertDoc._id = i
                insertDoc.priority = 5
                await this.db.collection(CollectionNames.STORE_VERSION_CODE_AND_PRIORITY).insertOne(insertDoc)
            }
            
    }

}