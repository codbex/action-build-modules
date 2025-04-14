import * as core from '@actions/core';
import { execSync } from 'child_process';

export class ExecutionUtils {
    public static run(command: string, cwd: string, groupName?: string): string {
        try {
            core.startGroup(groupName ?? command);
            core.info(`${cwd} ${command}`);
            const result = execSync(command, { cwd, encoding: 'utf-8', shell: '/bin/sh' });
            core.info(result);
            return result;
        } finally {
            core.endGroup();
        }
    }
}
