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
                ExecutionUtils.run('tsc --pretty', fullPath);
            } catch (e: unknown) {
                let errors = (e as ExecException).stdout;
                if (errors) {
                    errors = errors?.replaceAll('[91merror[0m[90m TS2688:', '');
                }
                core.info(`---------------------`);
                for (let i = 0; i < errors!.length; i++) {
                    console.log(`i = ${i} = ${errors?.charAt(i)}`);
                }
                core.info(`---------------------`);
                core.info(`Errors is: ${errors}`);
                if (!errors || errors.includes('[91merror[0m[90m TS')) {
                    core.error((e as ExecException).message);
                    core.error((e as ExecException).stdout ?? '');
                    core.error((e as ExecException).stderr ?? '');
                    throw e;
                }
                core.warning('Ignoring codbex "sdk" related errors');
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
