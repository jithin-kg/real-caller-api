import { Injectable, HttpException, HttpStatus, Inject } from "@nestjs/common";
import { UserDto } from "./user.dto";
import { User } from "./user.schema";
import { validateOrReject } from "class-validator";
import { Db } from "mongodb";


@Injectable()
export class Userservice {
    // constructor(@InjectModel("User") private readonly userModel: Model<User>) { }
    constructor(@Inject('DATABASE_CONNECTION') private db:Db ) { }

    async signup(userDto: UserDto): Promise<string> {
        
        
      try{
  
          console.log("user dto user id is "+userDto.uid);

          const user = await this.db.collection('users').findOne({uid:userDto.uid})
          console.log("user is "+user);

          if(user== null ){
            await validateOrReject(userDto) //validation
              try{  
                let newUser = await this.prepareUser(userDto);

               await this.db.collection('users').insertOne(newUser);
                
                return "1"
              }catch(err){
                  console.log("error while saving", err);
                  return "0"
              }
          }else{
              console.log("user exist")
              return "1";
          }
          
      }catch(err){
          console.log("validation erros ", err);
          return "0"
      }
        
       
  
}

private prepareUser(userDto:UserDto):User{
  let newUser = new UserDto();
  // newUser.accountType = userDto.accountType;
  newUser.email = userDto.email;
  newUser.firstName = userDto.firstName;
  newUser.uid = userDto.uid;
  newUser.gender = userDto.gender
  newUser.phoneNumber = userDto.phoneNumber;
  newUser.lastName = userDto.lastName
  
  return newUser;
}

}