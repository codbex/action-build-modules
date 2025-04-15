import * as core from '@actions/core';
import { context } from '@actions/github';
import { ExecException } from 'child_process';
import { readFileSync } from 'fs';
import path from 'path';
import { ExecutionUtils } from './ExecutionUtils.js';
import { InputUtils } from './InputUtils.js';

const errorToken = `[91merror[0m[90m TS`;
const ignoreError = `[91merror[0m[90m TS2688: [0mCannot find type definition file for '../modules/types'.`;

export async function run(): Promise<void> {
    try {
        const buildPackages = InputUtils.getArrayInput('packages-build');
        const npmrc = InputUtils.getInput('npmrc');

        for (const nextPackage of buildPackages) {
            core.notice(`Building ${nextPackage} module ...`);
            const fullPath = path.resolve(nextPackage);
            if (npmrc) {
                ExecutionUtils.run(`echo "${npmrc}" > .npmrc`, fullPath, 'Creating .npmrc');
            }
            ExecutionUtils.run('npm install', fullPath, 'Installing NPM dependencies');
            if (npmrc) {
                ExecutionUtils.run(`rm -rf .npmrc`, fullPath, 'Removing .npmrc');
            }
            try {
                ExecutionUtils.run('tsc --pretty', fullPath, 'Compiling TypeScript');
            } catch (e: unknown) {
                ignoreKnownErrors(e as ExecException);
            } finally {
                core.endGroup();
            }
            if (npmrc) {
                ExecutionUtils.run(`echo "${npmrc}" > .npmrc`, fullPath, 'Creating .npmrc');
            }
            if (npmrc) {
                const packageJson = JSON.parse(readFileSync(path.join(fullPath, 'package.json'), 'utf-8'));
                ExecutionUtils.run(`npm version ${packageJson.version}-${context.sha} --no-git-tag-version`, fullPath, 'Set the NPM version to the commit SHA');
                ExecutionUtils.run('npm publish --tag latest', fullPath, 'Publishing latest tag');
                ExecutionUtils.run(`rm -rf .npmrc`, fullPath, 'Removing .npmrc');
            }
        }
    } catch (error) {
        if (error instanceof Error) {
            core.setFailed(error.message);
        }
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
