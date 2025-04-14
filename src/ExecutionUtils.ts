import * as core from '@actions/core';
import { execSync } from 'child_process';

export class ExecutionUtils {
    public static run(command: string, cwd: string): string {
        core.info(`[${cwd}] $ ${command}`);
        const result = execSync(command, { cwd, encoding: 'utf-8' });
        core.info(result);
        return result;
    }
}
