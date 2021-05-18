/**
 * DTO Class containing
 * userId -> firebase userId
 * hUserId -> hashcallerUserId (combination of firebaseUserid and _id  hashed)
 * hUserId is used in token to uniquely identify a user
 *
 */
export class UserIdDTO{
    userId:string;
    hUserId:string
}