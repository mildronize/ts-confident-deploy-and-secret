import { DefaultAzureCredential } from "@azure/identity";
import { AzureKeyVault } from "./azure/keyvault";
import type { AzureContainerAppConfig, MatrixConfigBase } from "./types";
import { createServicePrincipalAndAssignRole } from "@thaitype/azure-service-principal";
import { AzureResourceId } from "./azure/resourceId";


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