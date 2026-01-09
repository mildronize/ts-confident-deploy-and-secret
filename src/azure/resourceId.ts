/**
 * For generating Azure resource IDs.
 */

export interface ResourceConfig {
  subscriptionId: string;
  resourceGroup: string;
  name: string;
}

export class AzureResourceId {

  static keyVault(config: ResourceConfig) {
    return `/subscriptions/${config.subscriptionId}/resourceGroups/${config.resourceGroup}/providers/Microsoft.KeyVault/vaults/${config.name}`;
  }

  static containerApp(config: ResourceConfig) {
    return `/subscriptions/${config.subscriptionId}/resourceGroups/${config.resourceGroup}/providers/Microsoft.App/containerApps/${config.name}`;
  }

  static storageAccount(config: ResourceConfig) {
    return `/subscriptions/${config.subscriptionId}/resourceGroups/${config.resourceGroup}/providers/Microsoft.Storage/storageAccounts/${config.name}`;
  }
}