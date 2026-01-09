# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a TypeScript-based project demonstrating **type-safe deployment and secret management** for Azure Container Apps. The core principle is using TypeScript as a central contract to govern both deployment configuration and secret lifecycle, ensuring confidence and security through structured, reviewable code.

## Runtime & Build Commands

This project uses Bun as the runtime:

```bash
# Install dependencies
bun install

# Run the main entry point (not typically used)
bun run index.ts

# Setup secrets for development resources
bun run src/entry/setup-secret.ts

# Generate deployment matrix output (used in CI/CD)
bun run src/entry/deploy.ts
```

No build step is required - Bun executes TypeScript directly.

## Architecture

### Core Design Pattern

The project implements a **typed configuration contract** that drives:
1. Service Principal creation with scoped permissions
2. Secret storage in Azure Key Vault
3. CI/CD deployment orchestration via GitHub Actions
4. Deployment to Azure Container Apps

### Key Architectural Layers

**1. Configuration Layer** (`src/config/`)
- Defines deployment targets using TypeScript types
- Example: `dev-dev.ts` defines development resources
- Each resource has a type (e.g., `azure_container_app`), credentials, and metadata
- Exports `devResources` as a typed record of deployment configurations

**2. Type System** (`src/libs/types.ts`)
- `MatrixConfigBase`: Base interface for all resource configurations
- `AzureContainerAppConfig`: Specific configuration for Container Apps
- `KeyVaultConfig`: Credential configuration for accessing secrets
- Types ensure compile-time validation of deployment configurations

**3. Secret Management** (`src/libs/setup-secret.ts`)
- `setupSecrets()`: Main orchestrator that validates resource types and dispatches to appropriate handlers
- `setupSecretsForContainerApp()`: Creates Service Principal, assigns least-privilege role to specific resource scope, stores credentials in Key Vault
- Idempotent: checks if secret exists before creating new one
- Uses `@thaitype/azure-service-principal` for Service Principal creation

**4. Azure Integration** (`src/libs/azure/`)
- `keyvault.ts`: `AzureKeyVault` class for Key Vault operations (get/set secrets with metadata)
- `resourceId.ts`: `AzureResourceId` class generates proper Azure resource ID strings for RBAC scope assignment
- `azure.ts`: Base class with Azure SDK error handling utilities

**5. CI/CD Integration** (`src/libs/github.ts`)
- `setOutput()`: Wraps `@actions/core` to output JSON for GitHub Actions matrix strategy
- Deployment matrix is generated from the same TypeScript configuration

### Security Model

**One Service Principal per Resource**: Each Azure Container App gets its own Service Principal with:
- Scoped permissions to exactly one resource (using Azure Resource IDs)
- Contributor role (TODO comment notes this is too broad and should use custom roles)
- Credentials stored in Key Vault, referenced by GitHub Actions secrets

**Secret Lifecycle**:
- Secrets are created automatically and stored in Azure Key Vault
- Deployed resources never access secrets directly
- GitHub Actions retrieves secrets from Key Vault at deploy time using a separate admin Service Principal
- No manual secret handling or duplication

### GitHub Actions Workflow

The `.github/workflows/deploy.yml` workflow:
1. **get-matrix** job: Runs `src/entry/deploy.ts` to generate deployment matrix from TypeScript config
2. **deploy** job: Uses matrix strategy to deploy each resource in parallel
   - Retrieves resource-specific Service Principal from Key Vault
   - Authenticates with Azure using that Service Principal
   - Deploys container image to Azure Container App with revision suffix
   - Cleans up sensitive logs and logs out

## File Structure

```
src/
├── config/          # Environment-specific deployment configurations
│   └── dev-dev.ts   # Development environment resources
├── entry/           # Entry points for different operations
│   ├── setup-secret.ts  # Script to setup secrets in Key Vault
│   └── deploy.ts    # Script to generate deployment matrix for CI/CD
├── libs/
│   ├── types.ts     # Core TypeScript interfaces and types
│   ├── setup-secret.ts  # Secret setup orchestration logic
│   ├── github.ts    # GitHub Actions integration utilities
│   └── azure/       # Azure SDK wrappers
│       ├── keyvault.ts   # Key Vault operations
│       ├── resourceId.ts # Resource ID generation
│       └── azure.ts      # Base Azure utilities
└── index.ts         # Minimal main entry point
```

## TypeScript Configuration

- Target: ESNext with bundler module resolution
- Strict mode enabled with additional strict flags (`noUncheckedIndexedAccess`, `noImplicitOverride`)
- No emit - Bun executes TypeScript directly
- Uses `moduleResolution: "bundler"` and allows importing `.ts` extensions

## Azure Authentication

The project uses `DefaultAzureCredential` from `@azure/identity`, which supports:
- Azure CLI authentication (for local development: `az login`)
- Managed Identity (for Azure-hosted environments)
- Environment variables (for CI/CD)

When running locally, ensure you're authenticated via `az login` before running setup scripts.

## Adding New Resources

To add a new deployment target:

1. Add configuration to `src/config/dev-dev.ts` (or create new environment config)
2. Ensure the config follows `MatrixConfigBase` or specific type like `AzureContainerAppConfig`
3. Run `bun run src/entry/setup-secret.ts` to create Service Principal and store in Key Vault
4. GitHub Actions will automatically include the new resource in deployment matrix

## Important Notes

- Service Principal permissions are currently set to "Contributor" role - this should be narrowed to custom roles with minimal required permissions (see TODO in `src/libs/setup-secret.ts:49`)
- Secret setup is idempotent - safe to rerun without creating duplicates
- Each resource must have unique `id`, `name`, and `service_principal_name`
- The project demonstrates principles, not a production-ready platform
