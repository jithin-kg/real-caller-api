import { Injectable, Inject, HttpException, HttpStatus } from "@nestjs/common";
import { Model } from 'mongoose'
import { Collection, Cursor, Db } from "mongodb";
import { type } from "os";
import { CollectionNames } from "src/db/collection.names";
import { ContactDto } from "src/contact/contact.dto";
import { NumberTransformService } from "src/utils/numbertransform.service";
import { RequestDTO } from "./requestDTO";
const hash = require('crypto').createHash;

@Injectable()
export class SearchMultipleNumberService {
 
     private collection:Collection
    // constructor(@InjectModel("User") private readonly userModel: Model<User>) { }
    constructor(@Inject('DATABASE_CONNECTION') private db:Db, private numberTranformService: NumberTransformService ) {
         this.collection = this.db.collection( CollectionNames.CONTACTS_COLLECTION);
    }


  

    /**
     * 
     * @param phoneNumbers 
     * @returns array containing contactdetails for each phone number
     * 
     */
    getDetailsForNumbers(phoneNumbers: RequestDTO): string {
        // this.numberTranformService.
        return ""
    }
    
}

