
export interface MatrixConfigBase {
  type: string;
  /**
   * Credential for getting config from any key store e.g. KeyVault
   */
  credential: KeyVaultConfig;
}

export interface AzureContainerAppConfig extends MatrixConfigBase {
  type: 'azure_container_app';
  /**
   * The unique identifier of the config e.g. resource name
   */
  id: string;
  /**
   * Resource name of the Container App
   */
  name: string;
  /**
   * Resource Group where the Container App is deployed
   */
  resource_group: string;
  /**
   * Additional Metadata for the config
   */
  metadata: Record<string, unknown> & {
    service_principal_name: string;
    subscription_id: string;
  }
}

export interface KeyVaultConfig {
  type: 'key_vault';
  /**
   * Github Actions Secret Name storing Azure Service Service Principal for accessing Azure Key Vault
   */
  gh_secret_name: string;
  /**
   * Azure Key Vault Name
   */
  vault_name: string;
  /**
   * Azure Key Vault Secret Name
   */
  secret_name: string;
}
