import * as dotenv from 'dotenv';
import * as fs from 'fs';

export class ConfigService {
    private readonly envConfig: Record<string, string> = dotenv.parse(fs.readFileSync('.env'));

    get(key): string {
        return this.envConfig[key];
    }

    static getENV() {
        return dotenv.parse(fs.readFileSync('.env'));
    }

    static isDevEnvironment(): boolean {
        return ConfigService.getENV().ENVIRONMENT === 'DEV';
    }
}