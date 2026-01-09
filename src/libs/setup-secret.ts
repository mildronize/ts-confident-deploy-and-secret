import { DefaultAzureCredential } from "@azure/identity";
import { AzureKeyVault } from "./azure/keyvault";
import type { AzureContainerAppConfig, MatrixConfigBase } from "./types";
import { createServicePrincipalAndAssignRole } from "@thaitype/azure-service-principal";
import { AzureResourceId } from "./azure/resourceId";


/**
 * Orchestrates secret setup for multiple resources across different types.
 *
 * This function validates resource types and dispatches each resource configuration
 * to the appropriate setup handler based on its type.
 *
 * @param config - A record mapping resource types to arrays of resource configurations
 * @param options - Optional configuration options
 * @param options.dryRun - If true, simulates the setup without making actual changes
 *
 * @throws {Error} If an invalid or missing resource type configuration is encountered
 *
 * @example
 * ```typescript
 * const config = {
 *   'azure_container_app': [containerAppConfig1, containerAppConfig2]
 * };
 * setupSecrets(config, { dryRun: false });
 * ```
 *
 * @remarks
 * Currently supports:
 * - `azure_container_app`: Azure Container Apps with Service Principal authentication
 *
 * Unsupported resource types will log a warning and be skipped.
 */
export function setupSecrets(config: Record<string, MatrixConfigBase[]>, options?: { dryRun?: boolean }) {
  const dryRun = options?.dryRun ?? false;

  console.log('🔐 Initializing Azure credentials...');
  const credential = new DefaultAzureCredential();
  console.log('✅ Azure credentials initialized');
  console.log('');

  for (const resourceType in config) {
    if (!config[resourceType]) throw new Error(`Invalid resource type config: ${resourceType}`);

    const resources = config[resourceType];
    console.log(`📦 Processing resource type: ${resourceType}`);
    console.log(`   Found ${resources.length} resource(s) to configure`);
    console.log('');

    for (const resourceConfig of resources) {
      if (resourceType === 'azure_container_app') {
        setupSecretsForContainerApp(credential, resourceConfig as AzureContainerAppConfig, { dryRun });
      } else {
        console.warn(`⚠️  Unsupported resource type: ${resourceType}, skipping setup`);
      }
    }
  }
}

/**
 * Sets up secrets for an Azure Container App by creating a Service Principal
 * with scoped permissions and storing credentials in Azure Key Vault.
 *
 * The function follows this workflow:
 * 1. Checks if the secret already exists in Key Vault (idempotency check)
 * 2. If not exists, creates a new Service Principal with appropriate role
 * 3. Assigns the Service Principal to the specific Container App scope
 * 4. Stores the Service Principal credentials as a secret in Key Vault
 *
 * @param credential - Azure credential for authentication
 * @param config - Configuration for the Azure Container App
 * @param options - Optional configuration options
 * @param options.dryRun - If true, simulates the setup without making actual changes
 *
 * @returns A promise that resolves when the setup is complete
 *
 * @throws {Error} If Azure API calls fail or if Key Vault operations are unauthorized
 *
 * @example
 * ```typescript
 * const credential = new DefaultAzureCredential();
 * const config = {
 *   id: 'app-001',
 *   type: 'azure_container_app',
 *   name: 'my-container-app',
 *   resource_group: 'my-rg',
 *   container_image: 'nginx:latest',
 *   credential: {
 *     type: 'key_vault',
 *     vault_name: 'my-kv',
 *     secret_name: 'my-sp-secret',
 *     gh_secret_name: 'AZURE_CREDENTIALS'
 *   },
 *   metadata: {
 *     subscription_id: '...',
 *     service_principal_name: 'my-sp'
 *   }
 * };
 * await setupSecretsForContainerApp(credential, config);
 * ```
 *
 * @remarks
 * - This function is idempotent: it skips creation if the secret already exists
 * - Currently assigns 'Contributor' role (TODO: narrow to custom role with minimal permissions)
 * - Service Principal scope is limited to the specific Container App resource
 * - Credentials are stored with metadata tags for tracking and auditing
 */
export async function setupSecretsForContainerApp(
  credential: DefaultAzureCredential,
  config: AzureContainerAppConfig,
  options?: { dryRun?: boolean }
) {
  const dryRun = options?.dryRun ?? false;

  console.log(`🔧 Setting up Container App: ${config.name}`);
  console.log(`   ID: ${config.id}`);
  console.log(`   Resource Group: ${config.resource_group}`);
  console.log('');

  if (dryRun) {
    console.log(`🔍 (DRY RUN MODE)`);
    console.log(`   Would create service principal: ${config.metadata.service_principal_name}`);
    console.log(`   Would assign Contributor role to scope`);
    console.log(`   Would store secret in Key Vault: ${config.credential.vault_name}`);
    console.log(`   Secret name: ${config.credential.secret_name}`);
    console.log('');
    return;
  }

  console.log('🔍 Checking if secret already exists in Key Vault...');
  const azureKeyVault = new AzureKeyVault(credential);
  const secret = await azureKeyVault.getSecretNullable(config.credential.vault_name, config.credential.secret_name);

  if (secret !== null) {
    console.log('✅ Secret already exists, skipping creation');
    console.log(`   Key Vault: ${config.credential.vault_name}`);
    console.log(`   Secret: ${config.credential.secret_name}`);
    console.log('');
    return;
  }

  console.log('🆕 Secret not found, proceeding with creation...');
  console.log('');

  console.log('🔑 Creating Service Principal and assigning role...');
  console.log(`   Service Principal Name: ${config.metadata.service_principal_name}`);
  console.log(`   Role: Contributor (⚠️  TODO: Narrow to custom role)`);
  console.log(`   Scope: ${config.name}`);

  const secretValue = await createServicePrincipalAndAssignRole({
    name: config.metadata.service_principal_name,
    // TODO: WARNING: this role is too broad, need to narrow down, e.g. Custom Role with only necessary permissions
    role: 'Contributor',
    scopes: [
      AzureResourceId.containerApp({
        name: config.name,
        resourceGroup: config.resource_group,
        subscriptionId: config.metadata.subscription_id,
      }),
    ],
    jsonAuth: true,
  });

  console.log('✅ Service Principal created successfully');
  console.log('');

  console.log('💾 Storing credentials in Azure Key Vault...');
  console.log(`   Vault: ${config.credential.vault_name}`);
  console.log(`   Secret: ${config.credential.secret_name}`);

  await azureKeyVault.setSecret({
    keyVaultName: config.credential.vault_name,
    secretName: config.credential.secret_name,
    secretValue: JSON.stringify(secretValue),
    metadata: {
      displayName: config.metadata.service_principal_name,
      contentType: 'json',
      secretType: 'service-principal',
    },
  });

  console.log('');
}