import { devResources } from "../config/dev-dev";
import { setupSecrets } from "../libs/setup-secret";

/**
 * Main entry point for setting up secrets for development resources.
 *
 * This script:
 * 1. Initializes Azure credentials
 * 2. Processes each resource configuration
 * 3. Creates Service Principals with scoped permissions
 * 4. Stores credentials securely in Azure Key Vault
 *
 * @remarks
 * This script is idempotent - it safely checks if secrets already exist
 * before creating new ones.
 *
 * Prerequisites:
 * - Azure CLI authenticated (`az login`)
 * - Appropriate permissions to create Service Principals
 * - Key Vault must exist and be accessible
 */
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