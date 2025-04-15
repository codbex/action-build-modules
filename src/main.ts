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
        const buildPackages = InputUtils.getArrayInput('packages');
        const npmrc = InputUtils.getInput('npmrc');
        const publish = InputUtils.getBooleanInput('publish');
        const publishLatestVersion = InputUtils.getBooleanInput('publish-latest-version');

        for (const nextPackage of buildPackages) {
            core.notice(`Building ${nextPackage} module ...`);
            const fullPath = path.resolve(nextPackage);

            createNpmrc(fullPath, npmrc);
            ExecutionUtils.run('npm install', fullPath, 'Installing NPM dependencies');
            removeNpmrc(fullPath, npmrc);

            try {
                ExecutionUtils.run('tsc --pretty', fullPath, 'Compiling TypeScript');
            } catch (e: unknown) {
                ignoreKnownErrors(e as ExecException);
            } finally {
                core.endGroup();
            }
            if (publish && npmrc) {
                publishPackage(npmrc, fullPath, publishLatestVersion);
            }
        }
    } catch (error) {
        if (error instanceof Error) {
            core.setFailed(error.message);
        }
    }
}

function createNpmrc(fullPath: string, npmrc: string) {
    if (npmrc) {
        ExecutionUtils.run(`echo "${npmrc}" > .npmrc`, fullPath, 'Creating .npmrc');
    }
}

function removeNpmrc(fullPath: string, npmrc: string) {
    if (npmrc) {
        ExecutionUtils.run(`rm -rf .npmrc`, fullPath, 'Removing .npmrc');
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
    core.notice('Ignoring codbex "sdk" related errors');
}

function publishPackage(npmrc: string, fullPath: string, publishLatestVersion: boolean) {
    createNpmrc(fullPath, npmrc);
    const packageJson = JSON.parse(readFileSync(path.join(fullPath, 'package.json'), 'utf-8'));
    if (publishLatestVersion) {
        ExecutionUtils.run(`npm version ${packageJson.version}-${context.sha} --no-git-tag-version`, fullPath, 'Set the NPM version to the commit SHA');
    }
    ExecutionUtils.run('npm publish --tag latest', fullPath, 'Publishing latest tag');
    removeNpmrc(fullPath, npmrc);
}
