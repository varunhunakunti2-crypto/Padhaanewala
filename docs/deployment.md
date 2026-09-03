# Deployment Documentation

## Pipeline
1. Push to `main` triggers Staging deployment.
2. Verified Staging deployment can be promoted to Production.

## Infrastructure
- **Frontend**: Vercel or AWS Amplify
- **Backend**: AWS EC2 / ECS or Render
- **Database**: Managed PostgreSQL (e.g., AWS RDS or Supabase)
