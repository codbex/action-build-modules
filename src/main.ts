import * as core from '@actions/core'

/**
 * The main function for the action.
 *
 * @returns Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const packages = core.getInput('packages')
    const packagesMultiline = core.getMultilineInput('packages')
    const buildPackages = core.getInput('build-packages')
    const buildPackagesMultiline = core.getMultilineInput('build-packages')
    const npmScope = core.getInput('npm-scope')

    // Debug logs are only output if the `ACTIONS_STEP_DEBUG` secret is true
    core.info(`packages: ${packages}`)
    core.info(`packagesMultiline: ${packagesMultiline}`)
    core.info(`buildPackages: ${buildPackages}`)
    core.info(`buildPackagesMultiline: ${buildPackagesMultiline}`)
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
