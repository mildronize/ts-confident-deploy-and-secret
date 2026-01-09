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

export class AzureKeyVault extends Azure {
  constructor(protected credential: DefaultAzureCredential) {
    super();
  }

  async getSecret(keyVaultName: string, secretName: string) {
    const keyVaultUrl = `https://${keyVaultName}.vault.azure.net`;
    const secretClient = new SecretClient(keyVaultUrl, this.credential);
    return secretClient.getSecret(secretName);
  }

  /**
   * Retrieves a secret from Azure Key Vault and returns it.
   * If the secret is not found, returns null instead of throwing an error.
   *
   * @param {string} keyVaultName - The name of the Azure Key Vault.
   * @param {string} secretName - The name of the secret to retrieve.
   * @returns {Promise<KeyVaultSecret | null>} A Promise that resolves to the retrieved secret,
   *                                          or null if the secret is not found.
   * @throws {Error} Throws an error if any other exception occurs during the retrieval process.
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
