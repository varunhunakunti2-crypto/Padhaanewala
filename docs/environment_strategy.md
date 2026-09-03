# Environment Strategy

## Environments

We maintain three separate environments to ensure stability and proper testing:

### 1. Development (Local & Dev Server)
- **Purpose**: Active development and local testing.
- **Database**: Local PostgreSQL instance.
- **Cache**: Local Redis.
- **URLs**: `http://localhost:3000` (Frontend), `http://localhost:8000` (Backend).
- **Secrets**: Stored in local `.env` files (not committed to Git).

### 2. Staging
- **Purpose**: Pre-production testing, QA, and client review. Matches production environment as closely as possible.
- **Database**: Managed PostgreSQL (Staging instance).
- **Cache**: Managed Redis (Staging instance).
- **URLs**: e.g., `staging.padhaanewala.in`
- **Secrets**: Managed via environment variables in the hosting provider.
- **Rules**: Never test major experimental changes directly on production; always pass through Staging first.

### 3. Production
- **Purpose**: Live environment for end-users.
- **Domain**: `padhaanewala.in`
- **Database**: Managed PostgreSQL (Production instance, high availability).
- **Storage**: S3/Cloudflare R2 for images and documents.
- **Secrets**: Securely managed via hosting provider (e.g., AWS Secrets Manager, Vercel Env Vars).
- **Rules**: 
  - Automated backups configured.
  - Strict CI/CD pipeline deployment only (no manual code edits).

## CI/CD Pipeline Flow
1. Developer pushes to `feature/*` or `bugfix/*` branch.
2. Pull Request created against `develop` branch.
3. Upon merge to `develop`, automated deployment to **Staging**.
4. Upon approval and merge from `develop` to `main`, automated deployment to **Production**.
