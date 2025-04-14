import * as core from '@actions/core';
import { InputUtils } from './InputUtils.js';

import path from 'path';
import { ExecutionUtils } from './ExecutionUtils.js';

/**
 * The main function for the action.
 *
 * @returns Resolves when the action is complete.
 */
export async function run(): Promise<void> {
    try {
        const packages = InputUtils.getArrayInput('packages');
        const buildPackages = InputUtils.getArrayInput('packages-build');
        const npmScope = InputUtils.getInput('npm-scope');

        // Debug logs are only output if the `ACTIONS_STEP_DEBUG` secret is true
        core.info(`packages: ${JSON.stringify(packages)}`);
        core.info(`buildPackages: ${JSON.stringify(buildPackages)}`);
        core.info(`npmScope: ${npmScope}`);

        for (const nextPackage of packages) {
            core.info(`${nextPackage} -> ${path.resolve(nextPackage)}`);
        }
        for (const nextPackage of buildPackages) {
            const fullPath = path.resolve(nextPackage);
            core.info(`${nextPackage} -> ${fullPath}`);
            ExecutionUtils.run('npm install', fullPath);
            ExecutionUtils.run('ls -lah', fullPath);
            core.warning('Starting tsc ...');
            try {
                const result = ExecutionUtils.runAsync('tsc --pretty', fullPath);
                core.warning(`Result: ${JSON.stringify(result, null, 4)}`);
            } catch (e: unknown) {
                core.warning(`Error occurred: ${e}`);
                core.warning(`Error message: ${(e as Error).message}`);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                if ((e as any).stderr) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    core.warning(`stderr: ${(e as any).stderr}`);
                }
                ExecutionUtils.run('ls -lah', fullPath);
            }
        }

        // Log the current timestamp, wait, then log the new timestamp
        core.warning(new Date().toTimeString());

        // Set outputs for other workflow steps to use
        core.setOutput('time', new Date().toTimeString());
    } catch (error) {
        // Fail the workflow run if an error occurs
        if (error instanceof Error) core.setFailed(error.message);
    }
}
