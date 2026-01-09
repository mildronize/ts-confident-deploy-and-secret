import * as core from '@actions/core';

/**
 * Sets a GitHub Actions workflow output with the given value.
 *
 * This function serializes the value to JSON and makes it available to subsequent
 * steps and jobs in the GitHub Actions workflow via the outputs context.
 *
 * @template TValue - The type of the value being set as output
 * @param value - The value to output (will be JSON stringified)
 * @param outputName - The name of the output variable
 *
 * @returns The original value that was passed in (for chaining or further use)
 *
 * @example
 * ```typescript
 * // Set a deployment matrix output
 * const matrix = {
 *   azure_container_app: [config1, config2]
 * };
 * setOutput(matrix, "deployment-matrix");
 *
 * // In workflow YAML:
 * // ${{ fromJson(steps.my-step.outputs.deployment-matrix) }}
 * ```
 *
 * @remarks
 * - The value is logged to console for debugging
 * - Uses GitHub Actions core library to set the output
 * - Output is JSON stringified and can be parsed with fromJson() in workflows
 */
export function setOutput<TValue>(value: TValue, outputName: string): TValue {
  console.log(`📤 Setting GitHub Actions output: ${outputName}`);
  console.log('');

  const debugValue = JSON.stringify(value, null, 2);
  console.log('📋 Deployment Matrix:');
  console.log(debugValue);
  console.log('');

  core.setOutput(outputName, JSON.stringify(value));

  console.log('✅ Output set successfully for GitHub Actions workflow');
  console.log('');

  return value;
}
