export class SpamerType {
    business: number = 0;
    person: number = 0;
    sales: number = 0;
    scam: number = 0;
    notSpecific: number = 0;

}

export enum SpammerTypeVAlues {
    SPAMMER_TYPE_BUSINESS = "1",
    SPAMMER_TYPE_PEERSON= "2",
    SPAMMER_TYPE_SALES = "3",
    SPAMMER_TYPE_SCAM = "4",
    SPAMMER_TYPE_NOT_SPECIFIC = "5"
}