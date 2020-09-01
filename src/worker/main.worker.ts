interface Task<data, result> {
    runAsync(data: data): Promise<result>
}

interface WorkPool {
    createTask<data, result>(f: (d: data) => Task<data, result>)
}

interface WorkerPoolOptions {
    workers: number;
}