# Workshop Guide: TypeScript for Confident Deploys and Safe Secrets | Northern Tech on the Rock 2026

A hands-on workshop to learn confident deployment and secret management for Azure Container Apps using TypeScript.

## Prerequisites

Before starting, ensure you have:

1. **Azure CLI** installed and authenticated (`az login`)
2. Install **Microsoft Authenticator** app on your mobile device for MFA on Azure, if you haven't already.
3. **Bun runtime** installed (v1.0.0 or later)
4. **Git** and **GitHub account**

## Workshop Information

The speaker has pre-configured the following Azure resources:

- **Subscription ID**: `0c249ac1-38ac-4cb4-a429-8b1448de6d8e`
- **Resource Group**: `rg-northern-tech-workshop`
- **Key Vault**: `kv-ntotr-shared`
- **Container Apps Environment**: `env-ntotr-workshop`
- **Your Container App**: `app-ntotr-yourname` (replace "yourname" with your assigned name)

## Part 1: Configure Your Project

### Step 1: Clone and Install Dependencies

Go to browser and create a new repository from the template: https://github.com/mildronize/ts-confident-deploy-and-secret

```bash
git clone <your-repo-url>
cd ts-confident-deploy-and-secret
bun install
```

### Step 2: Update Configuration

Edit `src/config/dev-dev.ts`:

```typescript
const displayName = 'yourname';  // Replace with your assigned name

export const devResources: Record<string, MatrixConfigBase[]> = {
  'azure_container_app': [
    {
      id: `dev-azure-container-app-ntotr-${displayName}`,
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
```

## Part 2: Set Up Secrets

### Step 3: Authenticate with Azure

```bash
az login --tenant 859c5c45-c82c-4178-b030-23cf68c69b88
az account set --subscription 0c249ac1-38ac-4cb4-a429-8b1448de6d8e
```

### Step 4: Create Service Principal and Store in Key Vault

```bash
bun run src/entry/setup-secret.ts
```

This script will:
- Create a Service Principal with least-privilege access to your Container App
- Store credentials in Azure Key Vault
- Output confirmation when complete

## Part 3: Configure GitHub Actions

### Step 5: Get Admin Credentials

The speaker has already created an admin Service Principal for GitHub Actions.

Ask the speaker for the `AZURE_CREDENTIALS_DEV` secret value.

### Step 6: Add GitHub Repository Secrets

Go to your GitHub repository **Settings > Secrets and variables > Actions > New repository secret**:

**Secret Name:** `AZURE_CREDENTIALS_DEV`
**Value:** Paste the value provided by the speaker

### Step 7: Verify Deployment Matrix

Test the deployment matrix generation locally:

```bash
bun run src/entry/deploy.ts
```

You should see JSON output with your Container App configuration.

## Part 4: Deploy

### Step 8: Trigger GitHub Actions Deployment

1. Go to **Actions** tab in your GitHub repository
2. Select **Deploy** workflow
3. Click **Run workflow** > **Run workflow**

### Step 9: Monitor Deployment

Watch the workflow execution:
- **get-matrix** job generates deployment configuration
- **deploy** job deploys your container app

### Step 10: Verify Deployment

```bash
# Get the Container App URL
az containerapp show \
  --name app-ntotr-yourname \
  --resource-group rg-northern-tech-workshop \
  --query properties.configuration.ingress.fqdn -o tsv
```

Visit the URL in your browser to confirm the deployment.

## Part 5: Understanding the Architecture

### What You Just Built

1. **Type-Safe Configuration**: TypeScript ensures deployment config is valid at compile-time
2. **Least-Privilege Security**: Each Container App has its own Service Principal with scoped permissions
3. **Automated Secret Management**: No manual secret handling; everything flows through Key Vault
4. **CI/CD Integration**: GitHub Actions deploys automatically using the same TypeScript config

### Key Files

- `src/config/dev-dev.ts`: Deployment configuration (single source of truth)
- `src/entry/setup-secret.ts`: Creates Service Principals and stores secrets
- `src/entry/deploy.ts`: Generates deployment matrix for GitHub Actions
- `.github/workflows/deploy.yml`: CI/CD pipeline

## Troubleshooting

**Permission Denied Errors**
```bash
# Ensure you're logged in with the correct subscription
az login --tenant 859c5c45-c82c-4178-b030-23cf68c69b88
az account set --subscription 0c249ac1-38ac-4cb4-a429-8b1448de6d8e
```

**Key Vault Access Issues**

If you can't access the Key Vault, contact the speaker to grant you access.

**Service Principal Already Exists**
- The setup script is idempotent; it will skip existing secrets
- To recreate, delete the secret from Key Vault first or use a different name

**Container App Not Found**
- Verify your Container App name matches the one provided by the speaker
- Check that you're using the correct resource group: `rg-northern-tech-workshop`

## Next Steps

- Add more Container Apps to `src/config/dev-dev.ts`
- Create additional environments (staging, production)
- Customize the deployment workflow
- Implement proper RBAC with custom roles (see TODO in `src/libs/setup-secret.ts:49`)

## Resources

- If you want to know how speaker prepared the infra, checkout the repo: https://github.com/mildronize/ts-confident-deploy-and-secret-speaker