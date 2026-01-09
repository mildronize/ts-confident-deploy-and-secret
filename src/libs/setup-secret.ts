import type { DefaultAzureCredential } from "@azure/identity";
import { AzureKeyVault } from "../azure/keyvault";
import type { AzureContainerAppConfig } from "./types";
import { createServicePrincipalAndAssignRole } from "@thaitype/azure-service-principal";
import { AzureResourceId } from "../azure/resourceId";

export async function setupSecretsForContainerApp(
  credential: DefaultAzureCredential,
  config: AzureContainerAppConfig,
  options?: { dryRun?: boolean }
) {
  const dryRun = options?.dryRun ?? false;

  if (dryRun) {
    console.log(`(dry run)...[${setupSecretsForContainerApp.name}]: Create service principal and assign role`);
    console.log(`(dry run)...[${setupSecretsForContainerApp.name}]: Set secret to azure key vault`);
    return;
  }

  const azureKeyVault = new AzureKeyVault(credential);
  const secret = await azureKeyVault.getSecretNullable(config.credential.vault_name, config.credential.secret_name);
  if (secret !== null) {
    console.warn('Secret is already exist, skip setup secret');
    return;
  }

  console.log('Setup secret');

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
}