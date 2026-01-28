# OpenCRVS Country Configuration Repository - Copilot Instructions

## Repository Overview

This is the OpenCRVS country configuration repository for Farajaland (a fictional country example). It's designed to be forked by implementing nations to customize OpenCRVS for their specific needs. The repository contains:

- **Purpose**: Configuration, reference data, and microservice APIs for OpenCRVS civil registration system
- **Size**: Medium-sized Node.js/TypeScript project with infrastructure configuration
- **Languages**: TypeScript (primary), JavaScript, Bash
- **Framework**: Hapi.js server framework
- **Runtime**: Node.js 22.15.1 (see `.nvmrc`)
- **Package Manager**: Yarn (v1)
- **Testing**: Vitest
- **Database**: PostgreSQL (analytics), MongoDB (OpenCRVS core), Elasticsearch

## Build and Development Setup

### Prerequisites
- Node.js 22.x (use nvm with `.nvmrc`: `nvm use`)
- Yarn package manager
- Docker and Docker Compose (for local database services)
- OpenCRVS Core must be running (this is a dependent service)

### Initial Setup
```bash
# Install dependencies (ALWAYS run this first)
yarn install

# Set up analytics database (required before starting dev server)
yarn setup-analytics
```

### Development Workflow

**Starting Development Server**
```bash
# Start the countryconfig service in development mode
yarn dev
# This runs: setup-analytics + nodemon with ts-node
# Expected: Server starts on port configured in environment
```

**Running Tests**
```bash
# Run all tests (uses Vitest)
yarn test

# Type checking (compilation check without emitting files)
yarn test:compilation
```

**Linting and Code Quality**
```bash
# Run ESLint
yarn lint

# Format code with Prettier (configured in .prettierrc)
# Lint-staged runs on git commits via Husky
```

### Build Process
This repository doesn't have a traditional build step for production. It uses:
- `ts-node --transpile-only` for production (see `yarn start:prod`)
- Docker containers for deployment (see `Dockerfile`)

### Database Management

**Development Database Operations**
```bash
# Clear all development databases (PostgreSQL analytics + Metabase)
yarn db:clear:all

# Re-setup analytics after clearing
yarn setup-analytics

# Start Metabase for analytics dashboards
yarn metabase
```

**Important**: PostgreSQL analytics schema must exist before running the service. Always run `yarn setup-analytics` after clearing databases or on first setup.

## Project Structure

### Key Directories and Files

**Root Level**
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration with path aliases (`@countryconfig/*`)
- `.nvmrc` - Node.js version (22.15.1)
- `.eslintrc.js` - ESLint configuration
- `.prettierrc` - Prettier formatting rules
- `vite.config.ts` - Vitest configuration
- `Dockerfile` - Production container configuration

**Source Code (`src/`)**
- `src/index.ts` - Main entry point, Hapi server setup (20KB file)
- `src/constants.ts` - Global constants
- `src/environment.ts` - Environment variable configuration
- `src/logger.ts` - Pino logger setup
- `src/api/` - API endpoints for OpenCRVS integration (14 subdirectories)
- `src/form/` - Form configuration for registration
- `src/data-seeding/` - Reference data and seed scripts
- `src/translations/` - i18n translation files (CSV format)
- `src/config/` - Application configuration
- `src/client-static/` - Static assets served to clients
- `src/analytics/` - Analytics and reporting configuration
- `src/utils/` - Shared utility functions

**Infrastructure (`infrastructure/`)**
- `infrastructure/deployment/` - Deployment scripts and Ansible playbooks
- `infrastructure/docker-compose.*.yml` - Environment-specific Docker configs
- `infrastructure/postgres/` - PostgreSQL setup scripts
- `infrastructure/metabase/` - Metabase analytics setup
- `infrastructure/monitoring/` - Monitoring configurations
- `infrastructure/environments/` - Environment initialization scripts
- `infrastructure/backups/` - Backup and restore scripts
- `infrastructure/clear-all-data-dev.sh` - Development database clearing
- `infrastructure/clear-all-data.sh` - Production data clearing (used in pipelines)

**Testing**
- `tests/` - Integration and validation tests
- `src/**/*.test.ts` - Unit tests co-located with source files

**CI/CD Workflows (`.github/workflows/`)**
- `test.yml` - Runs on PRs: compile, test, lint, shellcheck
- `on-pull-request.yaml` - Syncs changes to Farajaland fork
- `deploy.yml` - Deployment workflow
- `check-changelog.yml` - Ensures CHANGELOG.md is updated

## CI/CD and Validation

### Pull Request Checks
When a PR is opened, these checks run automatically:
1. **Compilation**: `yarn test:compilation` (TypeScript type checking)
2. **Tests**: `yarn test` (Vitest unit tests)
3. **Bash Linting**: ShellCheck on all .sh scripts (allows SC2086, SC2068 errors)

All checks must pass before merging. The test workflow runs on `ubuntu-24.04`.

### Manual Validation Steps
Before finalizing changes:
1. Run tests: `yarn test`
2. Check types: `yarn test:compilation`
3. Lint code: `yarn lint`
4. For infrastructure changes: validate Docker Compose files
5. For bash scripts: ensure they pass ShellCheck

### Common Issues and Workarounds

**Database Connection Issues**
- Ensure PostgreSQL is running: `docker ps | grep postgres`
- Check analytics schema exists: Run `yarn setup-analytics`
- Default connection: `localhost:5432`, user `postgres`, password `postgres`

**TypeScript Path Aliases**
- Use `@countryconfig/*` for imports within `src/`
- Configured in `tsconfig.json` baseUrl and paths
- Example: `import { API } from '@countryconfig/constants'`

**Translation Files**
- Translations are in CSV format: `src/translations/*.csv`
- Run `yarn sort-translations` after editing (enforced by lint-staged)
- Automatically runs on pre-commit via Husky

**Environment Variables**
- Managed by `envalid` package in `src/environment.ts`
- Use `dotenv` for local development
- Required vars: Check `src/environment.ts` for validation schema

## Dependencies and Architecture

**Key Dependencies**
- `@hapi/hapi` - Web server framework
- `@opencrvs/toolkit` - OpenCRVS shared utilities
- `joi` - Request validation
- `kysely` - TypeScript SQL query builder
- `pg` - PostgreSQL client
- `pino` - Logging
- `typescript` - v5.1.6

**OpenCRVS Integration**
This service depends on OpenCRVS Core and must be run alongside it. It provides:
1. Data seeding endpoints: `/application-config`, `/users`, `/roles`, `/locations`, `/statistics`, `/certificates`
2. Business critical APIs: `/forms`, notifications, dashboards
3. Static assets: Client configuration, login configuration

**Database Schema**
- PostgreSQL `events` database with `analytics` schema
- Metabase H2 database for dashboard configuration
- MongoDB (managed by OpenCRVS Core)
- Elasticsearch (managed by OpenCRVS Core)

## Development Best Practices

1. **Always install dependencies first**: `yarn install` before any development
2. **Type safety**: Use strict TypeScript, enable `noImplicitAny`, `strictNullChecks`
3. **Test changes**: Run `yarn test` after modifications
4. **Lint before commit**: Husky pre-commit hooks enforce linting and formatting
5. **Update CHANGELOG.md**: Required for all changes (checked in CI)
6. **Docker environment**: Use provided Docker Compose files for consistent environments
7. **Path aliases**: Use `@countryconfig/*` imports for cleaner code
8. **Translation management**: Always run `yarn sort-translations` after editing CSVs

## Additional Commands

```bash
# Environment management
yarn environment:init        # Initialize new environment
yarn environment:upgrade     # Upgrade existing environment

# Deployment
yarn deploy                  # Deploy to environment (requires configuration)

# Backups
yarn snapshot                # Create backup snapshot
yarn restore-snapshot        # Restore from backup

# Port forwarding (for remote environments)
yarn port-forward           # Forward remote services to localhost

# Metabase
yarn metabase               # Run Metabase locally for development
```

## Important Notes

- This repository is meant to be forked and customized per country
- Changes should maintain compatibility with OpenCRVS Core
- Test data and configuration are for the fictional country "Farajaland"
- Infrastructure scripts support multiple deployment environments (development, staging, QA, production)
- Analytics setup is critical - many features depend on the PostgreSQL analytics schema
- TypeScript compilation uses `--transpile-only` in production for faster startup
- License: MPL-2.0 (Mozilla Public License 2.0)

## Troubleshooting

**"Cannot find module" errors**
- Check `tsconfig.json` paths configuration
- Ensure `tsconfig-paths` is registered: `-r tsconfig-paths/register`

**Analytics/database errors on startup**
- Run `yarn setup-analytics`
- Check PostgreSQL is running and accessible
- Verify connection params in environment variables

**Test failures**
- Ensure dependencies are installed: `yarn install`
- Check Node version matches `.nvmrc`
- Vitest configuration in `vite.config.ts` uses `tsconfigPaths` plugin

**Docker Compose issues**
- Multiple compose files for different environments: `docker-compose.{env}-deploy.yml`
- Use appropriate file for your target environment

---

When making changes, prefer minimal modifications and always validate with tests and type checking before finalizing.
