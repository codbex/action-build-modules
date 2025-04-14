import * as core from '@actions/core'

/**
 * The main function for the action.
 *
 * @returns Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const packages = core.getMultilineInput('packages')
    const buildPackages = core.getMultilineInput('packages-build')
    const npmScope = core.getInput('npm-scope')

    // Debug logs are only output if the `ACTIONS_STEP_DEBUG` secret is true
    core.info(`packages: ${JSON.stringify(packages)}`)
    core.info(
      `buildPackages: ${JSON.stringify(buildPackages.map((e) => e.trim().substring(1)))}`
    )
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
