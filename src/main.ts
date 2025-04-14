import * as core from '@actions/core'
import { InputUtils } from './InputUtils.js'

/**
 * The main function for the action.
 *
 * @returns Resolves when the action is complete.
 */
export async function run(): Promise<void> {
    try {
        const packages = InputUtils.getArrayInput('packages')
        const buildPackages = InputUtils.getArrayInput('packages-build')
        const npmScope = InputUtils.getInput('npm-scope')

        // Debug logs are only output if the `ACTIONS_STEP_DEBUG` secret is true
        core.info(`packages: ${JSON.stringify(packages.map((e) => e.substring(2).trim()))}`)
        core.info(`buildPackages: ${JSON.stringify(buildPackages.map((e) => e.substring(2).trim()))}`)
        core.info(`npmScope: ${npmScope}`)

        // Log the current timestamp, wait, then log the new timestamp
        core.warning(new Date().toTimeString())

        // Set outputs for other workflow steps to use
        core.setOutput('time', new Date().toTimeString())
    } catch (error) {
        // Fail the workflow run if an error occurs
        if (error instanceof Error) core.setFailed(error.message)
    }
}
