import * as core from '@actions/core'
import { wait } from './wait.js'

/**
 * The main function for the action.
 *
 * @returns Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const ms: string = core.getInput('milliseconds')
    const packages = core.getMultilineInput('packages')
    const buildPackages = core.getMultilineInput('build-packages')
    const npmScope = core.getMultilineInput('npm-scope')

    // Debug logs are only output if the `ACTIONS_STEP_DEBUG` secret is true
    core.info(`packages: ${JSON.stringify(packages, null, 4)}`)
    core.info(`buildPackages: ${JSON.stringify(buildPackages, null, 4)}`)
    core.info(`npmScope: ${npmScope}`)
    core.warning(`Waiting ${ms} milliseconds ...`)

    // Log the current timestamp, wait, then log the new timestamp
    core.warning(new Date().toTimeString())
    await wait(parseInt(ms, 10))
    core.warning(new Date().toTimeString())

    // Set outputs for other workflow steps to use
    core.setOutput('time', new Date().toTimeString())
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
