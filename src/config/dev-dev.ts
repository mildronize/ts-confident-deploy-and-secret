import type { MatrixConfigBase } from "../libs/types";

export const devResources: MatrixConfigBase[] = [
  {
    id: 'dev-dev-001',
    type: 'azure_container_app',
    name: 'e2e-type-safety-deploy-and-secret-dev-dev-001',
    resource_group: 'e2e-type-safety-deploy-and-secret-rg-dev',
    location: 'eastus',
    credential: {
      type: 'key_vault',
      gh_secret_name: 'AZURE_CREDENTIALS_DEV',
      vault_name: 'e2e-type-safety-deploy-and-secret-kv-dev',
      secret_name: 'e2e-type-safety-deploy-and-secret-sp-dev-001',
    },
    metadata: {
      subscription_id: '973c8d8f-3f1c-4d92-9e1a-6f2b12f0b2e7',
      service_principal_name: 'e2e-type-safety-deploy-and-secret-sp-dev-001',
    },
  },
];