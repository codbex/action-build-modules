import { execSync } from 'child_process';

export class ExecutionUtils {
    static run(command: string, cwd: string): string {
        console.log(`[${cwd}] $ ${command}`);
        return execSync(command, { cwd, encoding: 'utf-8' });
    }
}
