import * as core from '@actions/core';
import { InputUtils } from './InputUtils.js';

import path from 'path';

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
            core.info(`${nextPackage} -> ${path.resolve(nextPackage)}`);
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
