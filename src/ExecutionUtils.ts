import { exec, execSync } from 'child_process';
import { promisify } from 'util';

export class ExecutionUtils {
    private static readonly execAsync = promisify(exec);

    public static run(command: string, cwd: string): string {
        console.log(`[${cwd}] $ ${command}`);
        return execSync(command, { cwd, encoding: 'utf-8' });
    }
    public static async runAsync(command: string, cwd: string): Promise<{ stdout: string; stderr: string }> {
        console.log(`[${cwd}] $ ${command}`);
        return await ExecutionUtils.execAsync(`cd ${cwd} && ${command}`);
    }
}
