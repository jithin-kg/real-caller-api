import { Module } from "@nestjs/common";
import { Db, MongoClient } from "mongodb";
import { async } from "rxjs";


@Module({
    providers:[
        {
            provide: 'DATABASE_CONNECTION',
            useFactory: async (): Promise<Db> =>{
                try{
                    const client = await  MongoClient.connect(DatabaseModule.uri,
                        {useUnifiedTopology:true})
                        return client.db('phoneNumberPrefixLocationMap')
                }catch(e){
                    console.log("Error while conneting via mongodb native driver")
                    throw e
                }
            }
        }
    ],
    exports: ['DATABASE_CONNECTION'],
})
export class DatabaseModule{
    static uri = "mongodb+srv://rlclerDBUser:IJVezz622jI7k83m@rlcaller-rest-cluster0-40d1h.mongodb.net/phoneNumberPrefixLocationMap?retryWrites=true&w=majority";

}