import * as core from '@actions/core';
import { InputUtils } from './InputUtils.js';

import path from 'path';
import { ExecutionUtils } from './ExecutionUtils.js';
import { ExecException } from 'child_process';

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
                core.warning(`Error cause: ${(e as ExecException).cause}`);
                core.warning(`Error cmd: ${(e as ExecException).cmd}`);
                core.warning(`Error code: ${(e as ExecException).code}`);
                core.warning(`Error killed: ${(e as ExecException).killed}`);
                core.warning(`Error message: ${(e as ExecException).message}`);
                core.warning(`Error name: ${(e as ExecException).name}`);
                core.warning(`Error signal: ${(e as ExecException).signal}`);
                core.warning(`Error stack: ${(e as ExecException).stack}`);
                core.warning(`Error stderr: ${(e as ExecException).stderr}`);
                core.warning(`Error stdout: ${(e as ExecException).stdout}`);

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
