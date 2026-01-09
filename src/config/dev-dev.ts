import type { MatrixConfigBase } from "../libs/types";

// TODO: Update to your own values
const displayName = 'mildr';

export const devResources: Record<string, MatrixConfigBase[]> = {
  'azure_container_app': [
    {
      id: 'dev-dev-001',
      type: 'azure_container_app',
      name: `app-ntotr-${displayName}`,
      resource_group: 'rg-northern-tech-workshop',
      container_image: 'ghcr.io/mildronize/kubricate-demo-azure-global-2025:main',
      credential: {
        type: 'key_vault',
        gh_secret_name: 'AZURE_CREDENTIALS_DEV',
        vault_name: 'kv-ntotr-shared',
        secret_name: `sp-azure-container-app-app-ntotr-${displayName}`,
      },
      metadata: {
        subscription_id: '0c249ac1-38ac-4cb4-a429-8b1448de6d8e',
        service_principal_name: `sp-ntotr-azure-container-app-app-ntotr-${displayName}`,
      },
    },
  ]
}