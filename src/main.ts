import * as core from '@actions/core';
import path from 'path';
import { InputUtils } from './InputUtils.js';
import { ExecutionUtils } from './ExecutionUtils.js';
import { ExecException } from 'child_process';

const errorToken = `[91merror[0m[90m TS`;
const ignoreError = `[91merror[0m[90m TS2688: [0mCannot find type definition file for '../modules/types'.`;

/**
 * The main function for the action.
 *
 * @returns Resolves when the action is complete.
 */
export async function run(): Promise<void> {
    try {
        const buildPackages = InputUtils.getArrayInput('packages-build');
        const npmrc = InputUtils.getInput('npmrc');

        ExecutionUtils.run('ls -lah', '/home/runner/work/MVP');
        ExecutionUtils.run('ls -lah', '/home/runner/work/MVP/MVP');
        ExecutionUtils.run('ls -lah', '/home/runner/work/MVP/MVP/workspace');

        // Debug logs are only output if the `ACTIONS_STEP_DEBUG` secret is true
        for (const nextPackage of buildPackages) {
            const fullPath = path.resolve(nextPackage);
            ExecutionUtils.run(`echo "${npmrc}" > .npmrc`, fullPath);
            if (npmrc) {
                ExecutionUtils.run(`echo "${npmrc}" > .npmrc`, fullPath);
                ExecutionUtils.run(`cat .npmrc`, fullPath);
            }
            ExecutionUtils.run('npm install', fullPath);
            if (npmrc) {
                ExecutionUtils.run(`rm -rf .npmrc`, fullPath);
            }
            try {
                ExecutionUtils.run('tsc --pretty', fullPath);
            } catch (e: unknown) {
                ignoreKnownErrors(e as ExecException);
            }
            ExecutionUtils.run('ls -lah', fullPath);
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

function ignoreKnownErrors(e: ExecException) {
    let errors = e.stdout;
    if (errors) {
        errors = errors?.replaceAll(ignoreError, '');
    }
    if (!errors || errors.includes(errorToken)) {
        core.error(e.message);
        core.error(e.stdout ?? '');
        core.error(e.stderr ?? '');
        throw e;
    }
    core.warning('Ignoring codbex "sdk" related errors');
}
