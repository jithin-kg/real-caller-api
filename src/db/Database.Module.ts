import { Module } from "@nestjs/common";
import { Db, MongoClient } from "mongodb";

// https://gusiol.medium.com/nestjs-with-mongodb-native-driver-9d82e377d55

@Module({
    providers:[
        {
            provide: 'DATABASE_CONNECTION',
            useFactory: async (): Promise<Db> =>{
                try{
                    const client = await  MongoClient.connect(DatabaseModule.uri,
                        {useUnifiedTopology:true})
                        const db = client.db('phoneNumberPrefixLocationMap')
                        //for creating index
                        // await db.collection('users').createIndex({ email: 1 }, { unique: true, sparse: true });
                        return db
                }catch(e){
                    console.log("Error while conneting via mongodb native driver")
                    throw e
                }
            }
        }
    ],
    exports: [DatabaseModule.DATABASE_CONNECTION],
})
export class DatabaseModule{
    static uri = "mongodb+srv://rlclerDBUser:IJVezz622jI7k83m@rlcaller-rest-cluster0-40d1h.mongodb.net/phoneNumberPrefixLocationMap?retryWrites=true&w=majority";
    static DATABASE_CONNECTION = "DATABASE_CONNECTION"
}

