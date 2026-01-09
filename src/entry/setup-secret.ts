import { devResources } from "../config/dev-dev";
import { setupSecrets } from "../libs/setup-secret";

function main() {
  console.log('Setup secret for dev resources');
  setupSecrets(devResources, { dryRun: false });
}

main();