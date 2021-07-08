export class processHelper {
    /**
     * 
     * @param processList 
     * an array, while using this function you should pass asyn functions.
     * 
     * example
     * let _processList=[asyncF1(),asyncF2(),asyncF3()];
     * let response=await doParallelProcess(_processList);
     * @returns we get array of objects.
     * let position=1 // response of our asyncF2() 
     * response[position].reason // error
     * response[position].value // success
     * response[position].status// fulfilled||rejected
     * 
     * at a time we get value or reason 
     * 
     * to get error list 
     * let rejectedProcessList = response.filter(({ status }) => status === processHelper.REJECTED);
     * you will get rejected processlist (array of objects) which contains status and reason
     * 
     */
    static async doParallelProcess(processList: any[]): Promise<processDto[]> {
        return new Promise(resolve => {
            Promise.allSettled([...processList]).then(res => {
                resolve(res);
            })
        })
    }

    static FULL_FILLED = "fulfilled"
    static REJECTED = "rejected"
}

class processDto {
    status: string; //fulfilled||rejected
    value?: any; //your async functions success response > resolve
    reason?: Error //your async functions error response > reject
}