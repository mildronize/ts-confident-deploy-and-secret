# High-Level Mini Project Specification

**TypeScript for Confident Deploys and Safe Secrets**

## 1. Introduction

This mini project demonstrates how **TypeScript can act as a central contract** for managing both **deployment** and **secret lifecycle** in a modern DevOps workflow.

Instead of treating secrets and deployment as separate concerns handled by different tools, the project shows how a **single typed configuration** can drive:

* Service Principal creation
* Secret storage in Azure Key Vault
* Secure deployment to Azure Container Apps
* CI/CD orchestration through GitHub Actions

The goal is not to build a complete platform, but to clearly show **how confidence and security emerge when rules live in code**.

---

## 2. Problem Statement

In many real systems:

* Secrets are created manually or inconsistently
* Permissions are widened to reduce operational overhead
* Deployment pipelines rely on shared or long-lived credentials
* Secret rotation is delayed because it is risky or unclear

These problems are not caused by Azure, CI/CD tools, or cloud platforms.
They are caused by **lack of structure and ownership over rules**.

This project addresses that by answering one question:

> *What if deployment rules and secret lifecycle were governed by the same typed contract?*

---

## 3. Core Design Principles

### 3.1 TypeScript as the Source of Truth

* All deployment and secret rules are defined in TypeScript
* Configuration is explicit, structured, and reviewable
* Invalid or inconsistent setups are caught early

TypeScript is not used as a scripting language, but as a **contract definition language**.

---

### 3.2 One Service Principal per Deployment Target

* Each Azure Container App has its own Service Principal
* Permissions are scoped to the exact resource
* No shared credentials across environments

This aligns with **least privilege** and reduces blast radius.

---

### 3.3 Secrets as Managed Resources

Secrets are treated as first-class entities with a lifecycle:

* Created automatically
* Stored in Azure Key Vault
* Consumed by deployment workflows
* Rotated when needed
* Destroyed when no longer relevant

No manual copying or ad-hoc handling.

---

## 4. High-Level System Overview

At a conceptual level, the system consists of four layers:

### 4.1 Configuration Layer (TypeScript)

A typed configuration defines:

* What resources exist
* What type they are (e.g. Azure Container App)
* How they authenticate
* Where secrets should be stored
* Which identity is responsible

This configuration is environment-specific but structurally consistent.

---

### 4.2 Secret Setup Layer

From the configuration, the system:

* Creates a Service Principal
* Assigns the appropriate role and scope
* Stores the credentials securely in Azure Key Vault
* Avoids recreating secrets if they already exist

This process is **idempotent** and safe to rerun.

---

### 4.3 Deployment Orchestration Layer

The same configuration is used to:

* Generate a deployment matrix
* Feed CI/CD workflows
* Ensure deployments and secrets stay aligned

CI/CD does not define rules — it executes them.

---

### 4.4 Identity and Access Layer

All actions are executed using identities, not humans:

* GitHub Actions authenticates via Azure credentials
* Azure SDKs use managed or delegated identity
* Permissions are explicit and scoped

This ensures traceability and auditability.

---

## 5. End-to-End Flow

1. A typed configuration defines a deployment target
2. Secrets are created or verified based on that configuration
3. Service Principals are generated and scoped correctly
4. Secrets are stored in Azure Key Vault
5. CI/CD workflows consume the configuration
6. Azure Container Apps are deployed using those secrets

At no point is a secret manually handled or duplicated.

---

## 6. What This Project Intentionally Does *Not* Do

To keep the workshop focused, this project does **not**:

* Manage complex infrastructure provisioning
* Implement advanced networking or scaling
* Optimize permissions beyond a clear baseline
* Cover multiple cloud providers

These are deliberate exclusions to keep the mental model clear.

---

## 7. Why This Matters

This mini project illustrates a shift in mindset:

* Security is not enforced by tools, but by structure
* Automation is not about speed, but about predictability
* Secrets do not become safer by being fewer
* They become safer by being **governed**

By putting rules in TypeScript, teams gain confidence that:

* Deployments are reproducible
* Secrets are handled consistently
* Changes are reviewable and reversible
* The system scales without sacrificing security

---

## 8. Future Extensions (Conceptual)

While out of scope for the workshop, the same approach can later extend to:

* Infrastructure as Code using CDKTF or Pulumi
* Multi-environment or ephemeral environments
* Custom Azure roles with minimal permissions
* Automated secret rotation policies

The contract remains the same — only the execution layer grows.

---

### Closing Note

This project is not about Azure, GitHub Actions, or TypeScript alone.
It is about **building confidence through structure**, and letting automation enforce what teams already believe is the right thing to do.