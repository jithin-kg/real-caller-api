import { Module } from "@nestjs/common";
import { Db, MongoClient } from "mongodb";

// https://gusiol.medium.com/nestjs-with-mongodb-native-driver-9d82e377d55
//todo move to app module
@Module({
    providers:[
        {
            provide: 'DATABASE_CONNECTION',
            useFactory: async (): Promise<Db> =>{
                try{
                    console.log(`Trying to connect to mongodb using uris ${DatabaseModule.uri} `)
                    const client = await  MongoClient.connect(DatabaseModule.uri,
                        {useUnifiedTopology:true})
                        console.log(`client is ${client}`)
                        const db = client.db()
                        //for creating index
                        // await db.collection('users').createIndex({ email: 1 }, { unique: true, sparse: true });
                        return db
                }catch(e) {
                    console.log("Error while conneting via mongodb native driver")
                    throw e
                }
            }
        }
    ],
    exports: [DatabaseModule.DATABASE_CONNECTION],
})
export class DatabaseModule {
    static uri = "mongodb+srv://rlclerDBUser:IJVezz622jI7k83m@rlcaller-rest-cluster0-40d1h.mongodb.net/phoneNumberPrefixLocationMap?retryWrites=true&w=majority";
    // static uri = process.env.MONGO_URL || 'mongodb://localhost:27017/dev';
    // static uri =  "mongodb://" + process.env.DATABASE_USER + ":" + process.env.DATABASE_PASSWORD + "@" + process.env.DATABASE_HOST + "/" + process.env.DATABASE_NAME;
    
    // this one worked //jithinkg/hcallerapi:1.0.15  with below uri
    // static uri =  "mongodb://" + "root"+ ":" + "rf6f2k6KsJ"+ "@" + "10.128.122.3:27017" 
    
    //below one also worked for 
    // helm install my-release \
    // --set auth.rootPassword=secretpassword,auth.username=my-user,auth.password=my-password,auth.database=my-database \
    // bitnami/mongodb


    // static uri =  "mongodb://" + "my-user"+ ":" + "my-password"+ "@" + "10.128.165.8:27017" + "/"+ "my-database"
//    kubectl, the official Kubernetes client. Use version 1.21.2 of kubectl to ensure you are within one minor version of your cluster's Kubernetes version.

    static DATABASE_CONNECTION = "DATABASE_CONNECTION"
}

