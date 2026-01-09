import * as core from '@actions/core';

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
