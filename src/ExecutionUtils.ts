import { execSync } from 'child_process';

export class ExecutionUtils {
    static run(command: string, cwd: string) {
        console.log(`[${cwd}] $ ${command}`);
        execSync(command, { cwd, stdio: 'inherit' });
    }
}
