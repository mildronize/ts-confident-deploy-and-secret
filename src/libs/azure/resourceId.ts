/**
 * Configuration for generating Azure resource IDs.
 *
 * @property subscriptionId - Azure subscription ID (GUID format)
 * @property resourceGroup - Name of the resource group
 * @property name - Name of the specific resource
 */
export interface ResourceConfig {
  subscriptionId: string;
  resourceGroup: string;
  name: string;
}

/**
 * Utility class for generating Azure resource IDs in the standard ARM format.
 *
 * Azure Resource Manager (ARM) uses hierarchical resource IDs to uniquely identify
 * resources. These IDs are used for RBAC role assignments, policy scopes, and
 * resource references.
 *
 * @remarks
 * Resource ID format:
 * `/subscriptions/{subscriptionId}/resourceGroups/{resourceGroup}/providers/{provider}/{resourceType}/{resourceName}`
 */
export class AzureResourceId {

  /**
   * Generates a resource ID for an Azure Key Vault.
   *
   * @param config - Configuration containing subscription, resource group, and vault name
   *
   * @returns The fully qualified Azure resource ID for the Key Vault
   *
   * @example
   * ```typescript
   * const vaultId = AzureResourceId.keyVault({
   *   subscriptionId: '12345678-1234-1234-1234-123456789abc',
   *   resourceGroup: 'my-rg',
   *   name: 'my-keyvault'
   * });
   * // Returns: /subscriptions/12345678-.../resourceGroups/my-rg/providers/Microsoft.KeyVault/vaults/my-keyvault
   * ```
   */
  static keyVault(config: ResourceConfig) {
    return `/subscriptions/${config.subscriptionId}/resourceGroups/${config.resourceGroup}/providers/Microsoft.KeyVault/vaults/${config.name}`;
  }

  /**
   * Generates a resource ID for an Azure Container App.
   *
   * @param config - Configuration containing subscription, resource group, and app name
   *
   * @returns The fully qualified Azure resource ID for the Container App
   *
   * @example
   * ```typescript
   * const appId = AzureResourceId.containerApp({
   *   subscriptionId: '12345678-1234-1234-1234-123456789abc',
   *   resourceGroup: 'my-rg',
   *   name: 'my-container-app'
   * });
   * // Used for RBAC role assignment scope
   * await assignRole({ scope: appId, role: 'Contributor' });
   * ```
   */
  static containerApp(config: ResourceConfig) {
    return `/subscriptions/${config.subscriptionId}/resourceGroups/${config.resourceGroup}/providers/Microsoft.App/containerApps/${config.name}`;
  }

  /**
   * Generates a resource ID for an Azure Storage Account.
   *
   * @param config - Configuration containing subscription, resource group, and storage account name
   *
   * @returns The fully qualified Azure resource ID for the Storage Account
   *
   * @example
   * ```typescript
   * const storageId = AzureResourceId.storageAccount({
   *   subscriptionId: '12345678-1234-1234-1234-123456789abc',
   *   resourceGroup: 'my-rg',
   *   name: 'mystorageaccount'
   * });
   * ```
   */
  static storageAccount(config: ResourceConfig) {
    return `/subscriptions/${config.subscriptionId}/resourceGroups/${config.resourceGroup}/providers/Microsoft.Storage/storageAccounts/${config.name}`;
  }
}