import { devResources } from "../config/dev-dev";
import { setupSecrets } from "../libs/setup-secret";

function main() {
  console.log('');
  console.log('🚀 Starting Secret Setup for Development Resources');
  console.log('================================================');
  console.log('');

  setupSecrets(devResources, { dryRun: false });

  console.log('');
  console.log('✨ Secret setup process completed!');
  console.log('');
}

main();