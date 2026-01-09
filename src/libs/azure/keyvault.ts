import { DefaultAzureCredential } from '@azure/identity';
import { type KeyVaultSecret, SecretClient } from '@azure/keyvault-secrets';
import { Azure } from './azure';

interface SetSecretConfig {
  keyVaultName: string;
  secretName: string;
  secretValue: string;
  metadata: {
    /**
     * Service Principal Name for the service principal that will be created
     * Keep it blank if you use other type of secret to store.
     */
    displayName?: string;
    // eslint-disable-next-line @typescript-eslint/ban-types
    secretType: 'service-principal' | 'publish-profile' | (string & {});
    // eslint-disable-next-line @typescript-eslint/ban-types
    contentType: 'json' | 'xml' | (string & {});
    /**
     * Purpose of the secret,
     * @default 'Deploy with GitHub Actions'
     */
    purpose?: string;
  };
}

/**
 * Azure Key Vault client wrapper for managing secrets.
 *
 * Provides methods to retrieve and store secrets in Azure Key Vault
 * with proper error handling and logging.
 */
export class AzureKeyVault extends Azure {
  /**
   * Creates a new AzureKeyVault instance.
   *
   * @param credential - Azure credential for authenticating with Key Vault
   */
  constructor(protected credential: DefaultAzureCredential) {
    super();
  }

  /**
   * Retrieves a secret from Azure Key Vault.
   *
   * @param keyVaultName - The name of the Azure Key Vault (without .vault.azure.net)
   * @param secretName - The name of the secret to retrieve
   *
   * @returns A promise that resolves to the Key Vault secret
   *
   * @throws {Error} If the secret is not found or if access is denied
   *
   * @example
   * ```typescript
   * const kv = new AzureKeyVault(credential);
   * const secret = await kv.getSecret('my-vault', 'my-secret');
   * console.log(secret.value);
   * ```
   */
  async getSecret(keyVaultName: string, secretName: string) {
    const keyVaultUrl = `https://${keyVaultName}.vault.azure.net`;
    const secretClient = new SecretClient(keyVaultUrl, this.credential);
    return secretClient.getSecret(secretName);
  }

  /**
   * Retrieves a secret from Azure Key Vault, returning null if not found.
   *
   * This method provides a null-safe alternative to getSecret() by catching
   * the SecretNotFound error and returning null instead of throwing.
   *
   * @param keyVaultName - The name of the Azure Key Vault (without .vault.azure.net)
   * @param secretName - The name of the secret to retrieve
   *
   * @returns A promise that resolves to the Key Vault secret, or null if not found
   *
   * @throws {Error} If any error other than SecretNotFound occurs (e.g., access denied)
   *
   * @example
   * ```typescript
   * const kv = new AzureKeyVault(credential);
   * const secret = await kv.getSecretNullable('my-vault', 'my-secret');
   *
   * if (secret === null) {
   *   console.log('Secret does not exist, creating new one...');
   *   // Create new secret
   * } else {
   *   console.log('Secret already exists, skipping creation');
   * }
   * ```
   *
   * @remarks
   * This method is useful for implementing idempotent operations where you want
   * to check if a secret exists before creating it.
   */
  async getSecretNullable(keyVaultName: string, secretName: string): Promise<KeyVaultSecret | null> {
    try {
      const secret = await this.getSecret(keyVaultName, secretName);
      return secret;
    } catch (error: unknown) {
      if (this.isRestError(error) && error.code === 'SecretNotFound') {
        return null;
      }
      throw error;
    }
  }

  /**
   * Stores a secret in Azure Key Vault with metadata tags.
   *
   * Creates or updates a secret in the specified Key Vault, along with metadata
   * tags for tracking the secret's purpose, type, and ownership.
   *
   * @param config - Configuration for the secret to be stored
   * @param config.keyVaultName - The name of the Azure Key Vault (without .vault.azure.net)
   * @param config.secretName - The name for the secret
   * @param config.secretValue - The value to store (typically JSON stringified credentials)
   * @param config.metadata - Metadata information for the secret
   * @param config.metadata.displayName - Display name (e.g., Service Principal name)
   * @param config.metadata.secretType - Type of secret (e.g., 'service-principal', 'publish-profile')
   * @param config.metadata.contentType - Content format (e.g., 'json', 'xml')
   * @param config.metadata.purpose - Purpose description (defaults to 'Deploy with GitHub Actions')
   *
   * @returns A promise that resolves when the secret is successfully stored
   *
   * @throws {Error} If the Key Vault operation fails or if access is denied
   *
   * @example
   * ```typescript
   * const kv = new AzureKeyVault(credential);
   * await kv.setSecret({
   *   keyVaultName: 'my-vault',
   *   secretName: 'my-sp-secret',
   *   secretValue: JSON.stringify(servicePrincipalCredentials),
   *   metadata: {
   *     displayName: 'my-service-principal',
   *     secretType: 'service-principal',
   *     contentType: 'json',
   *     purpose: 'Deploy to Azure Container Apps'
   *   }
   * });
   * ```
   *
   * @remarks
   * - Metadata is stored as tags on the Key Vault secret
   * - Tags are useful for auditing and organizing secrets
   * - If the secret already exists, it will be overwritten
   */
  async setSecret(config: SetSecretConfig) {
    const keyVaultUrl = `https://${config.keyVaultName}.vault.azure.net`;
    const secretClient = new SecretClient(keyVaultUrl, this.credential);

    // Store the service principal credentials as a secret in Key Vault
    await secretClient.setSecret(config.secretName, config.secretValue, {
      tags: {
        type: config.metadata.secretType,
        purpose: config.metadata.purpose ?? 'Deploy with GitHub Actions',
        displayName: config.metadata.displayName ?? '',
        contentType: config.metadata.contentType,
      },
    });

    console.log(`✅ Secret stored successfully in Key Vault`);
    console.log(`   Secret Name: ${config.secretName}`);
    console.log(`   Type: ${config.metadata.secretType}`);
    console.log(`   Purpose: ${config.metadata.purpose ?? 'Deploy with GitHub Actions'}`);
  }
}
