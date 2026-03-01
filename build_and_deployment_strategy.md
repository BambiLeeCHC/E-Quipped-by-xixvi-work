# E-Quipped: Build & Deployment Strategy

**Author:** Manus AI
**Date:** March 01, 2026

## 1. Introduction

This document provides a comprehensive analysis of the `E-Quipped-by-xixvi-work` repository and presents a detailed, actionable strategy for building and deploying the application to a production environment. The analysis covers the project's architecture, technology stack, and dependencies, leading to a recommended deployment solution that prioritizes efficiency, scalability, and ease of management.

## 2. Architecture & Technology Stack Analysis

The repository is structured as a modern full-stack monorepo, managed with `pnpm` workspaces. It contains a primary application and several legacy directories that are no longer in use. The core application is a sophisticated AI learning platform featuring a rich user interface, a powerful backend, and integrations with various third-party services.

### 2.1. Project Structure

The main application logic is contained within a unified project structure at the root, which is a significant shift from the legacy `frontend` (Create React App) and `backend` (Python/FastAPI) directories. The current, active structure is a TypeScript-based monorepo.

| Directory | Purpose |
| :--- | :--- |
| `/` | **Root**: Contains the main `package.json`, `pnpm` workspace configuration, and build scripts. |
| `/client/` | **Frontend**: The React application built with Vite, including all UI components, pages, and client-side logic. |
| `/server/` | **Backend**: The Node.js API server built with Express and tRPC, handling all business logic and data access. |
| `/drizzle/` | **Database**: Contains the Drizzle ORM schema definitions, migration files, and database configuration. |
| `/shared/` | **Shared Code**: TypeScript types and constants used by both the client and server to ensure type safety across the stack. |

### 2.2. Technology Stack

The application leverages a modern, robust technology stack designed for performance and developer experience.

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Package Manager** | `pnpm` | Efficiently manages dependencies in the monorepo. |
| **Frontend** | React, Vite, TypeScript | A fast, modern web framework with static typing for robust UI development. |
| **UI** | Tailwind CSS, shadcn/ui | A utility-first CSS framework and a component library for building a consistent and beautiful UI. |
| **Backend** | Node.js, Express, tRPC | A TypeScript-first API framework that provides end-to-end typesafe APIs without code generation. |
| **Database ORM** | Drizzle ORM | A modern TypeScript ORM used with a MySQL-compatible database. |
| **Authentication** | Manus OAuth | The application relies on the Manus platform for user authentication, managed via specific environment variables. |
| **Payments** | Stripe | Integrated for handling payments, utilizing Stripe Checkout and webhooks for event handling. |
| **External Services** | Manus Forge | Used for server-side LLM invocations and S3-compatible file storage, requiring API keys. |

## 3. Recommended Deployment Strategy

Based on the project's architecture and dependencies, **Railway** is the recommended platform for deployment. It offers native support for Node.js monorepos, integrated database services (including MySQL), and a simple, usage-based pricing model that is well-suited for this application.

### 3.1. Platform Choice: Railway

Railway provides a seamless deployment experience for this stack due to the following advantages:

*   **Monorepo Support**: Railway can automatically detect and deploy multiple services from a single repository, which is ideal for the frontend/backend split in this project.
*   **Integrated Services**: It allows for provisioning a MySQL database directly within the project, simplifying connection and management.
*   **Automatic Builds**: It connects directly to the GitHub repository and triggers new builds and deployments on every push to the `main` branch.
*   **Environment Variable Management**: It offers a secure and user-friendly interface for managing all the required secrets and API keys.

### 3.2. Deployment Steps

Here is the step-by-step guide to building and deploying the E-Quipped application on Railway.

#### Step 1: Prepare the Repository

The project is already well-structured for deployment. The root `package.json` contains the necessary `build` and `start` scripts. The build process is a two-stage operation:

1.  `vite build`: This command bundles the React frontend application (from the `/client` directory) into a static `dist/public` directory.
2.  `esbuild ...`: This command bundles the Node.js/Express backend server (from the `/server` directory) into a `dist/` directory, creating an `index.js` entry point.

Upon deployment, Railway will automatically run the `pnpm install` and `pnpm build` commands.

#### Step 2: Configure the Railway Project

1.  **Create a New Project**: Create a new project on Railway and link it to the `BambiLeeCHC/E-Quipped-by-xixvi-work` GitHub repository.

2.  **Add a MySQL Database**: Within the Railway project, add a new service and select "Database" > "MySQL". Railway will provide the connection string (e.g., `DATABASE_URL`) which will be used as an environment variable.

3.  **Configure the Main Service**: Railway will detect the `package.json` and configure a Node.js service. The following settings must be configured in the service's "Settings" tab:

    *   **Build Command**: `pnpm install && pnpm build`
    *   **Start Command**: `pnpm start`
    *   **Root Directory**: `/`

4.  **Set Environment Variables**: This is the most critical step. All required environment variables must be added to the Railway service. These include secrets for the database, authentication, and third-party services.

| Variable | Description | Value |
| :--- | :--- | :--- |
| `DATABASE_URL` | Connection string for the MySQL database. | Provided by the Railway MySQL service. |
| `VITE_APP_ID` | The Manus application ID for OAuth. | (Secret) Obtain from Manus developer settings. |
| `OAUTH_SERVER_URL` | The base URL for the Manus OAuth service. | (Secret) Obtain from Manus developer settings. |
| `VITE_OAUTH_PORTAL_URL` | The URL for the Manus user-facing login portal. | (Secret) Obtain from Manus developer settings. |
| `JWT_SECRET` | A long, random string for signing session tokens. | Generate a secure secret (e.g., using a password generator). |
| `BUILT_IN_FORGE_API_URL` | The URL for the Manus Forge API (LLM, Storage). | (Secret) Obtain from Manus developer settings. |
| `BUILT_IN_FORGE_API_KEY` | The API key for the Manus Forge API. | (Secret) Obtain from Manus developer settings. |
| `OWNER_OPEN_ID` | The Manus OpenID of the application owner (for auto-admin). | (Secret) Obtain from Manus user profile. |
| `STRIPE_SECRET_KEY` | The secret key for your Stripe account. | (Secret) Obtain from the Stripe dashboard. |
| `STRIPE_WEBHOOK_SECRET` | The signing secret for the Stripe webhook endpoint. | (Secret) Obtain after creating the webhook endpoint in Stripe. |
| `STRIPE_PRICE_LIFETIME` | The Stripe Price ID for the lifetime plan. | (Secret) Obtain from the Stripe dashboard. |
| `NODE_ENV` | Sets the environment to production. | `production` |

#### Step 3: Configure the Stripe Webhook

Once the application is deployed for the first time, Railway will provide a public domain (e.g., `e-quipped-prod.up.railway.app`).

1.  Go to the Stripe Dashboard > Developers > Webhooks.
2.  Click "Add an endpoint".
3.  Set the **Endpoint URL** to `https://<your-railway-domain>/api/stripe/webhook`.
4.  Select the events to listen for, as handled in `server/stripe/webhook.ts` (e.g., `checkout.session.completed`, `customer.subscription.updated`, etc.).
5.  Click "Add endpoint". Stripe will reveal the **Signing secret**. Copy this value and add it to your Railway environment variables as `STRIPE_WEBHOOK_SECRET`.

#### Step 4: Run Database Migrations

The application uses Drizzle ORM for database schema management. After the first successful deployment, you must run the migrations to set up the database tables.

1.  Install the Railway CLI on your local machine.
2.  Link your local project to the deployed Railway project: `railway link`
3.  Run the migration command against the production database: `railway run pnpm db:push`

This command executes `drizzle-kit generate` and `drizzle-kit migrate`, which will apply the schema defined in `/drizzle/schema.ts` to your Railway MySQL database.

## 4. Conclusion

By following this strategy, the E-Quipped application can be reliably built and deployed to a scalable, production-ready environment on Railway. The key to a successful deployment lies in the meticulous configuration of environment variables, as the application's core features (authentication, payments, AI services) are dependent on these secrets. The monorepo structure is well-suited for Railway's deployment model, and the use of modern tools like Vite, esbuild, and Drizzle ORM ensures a performant and maintainable application.
