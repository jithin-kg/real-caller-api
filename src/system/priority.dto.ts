import { IsInt, Max, Min } from "class-validator";

export class PriorityReqDto {
    @IsInt()
    @Min(1)
    @Max(10000)
    versionCode: number
}

export class PriorityResDto {
    versionCode: number
    priority:number = -1
}