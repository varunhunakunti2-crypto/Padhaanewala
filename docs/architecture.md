# System Architecture

## Overview
Padhaanewala is a scalable education platform built on a modern stack.

**Core Stack:**
- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Python, FastAPI, REST API
- **Database**: PostgreSQL with pgvector for AI context
- **Cache/Queue**: Redis (for caching & background tasks with Celery)
- **Storage**: AWS S3 or Cloudflare R2 (for images and media)
- **AI Processing**: Integrated securely in the backend, never exposing API keys to the frontend.

## Data Flow Architecture
`Student/Admin → Next.js Frontend → REST APIs → FastAPI Backend → PostgreSQL / Redis / AI / Storage → Response`

## Key Rules
1. All major content is database-driven (no hardcoded data in React components).
2. AI features (like College Predictor) must rely on verified database information and state uncertainty where applicable.
3. Mobile responsiveness is a primary requirement.
4. Security is integrated from the start (HTTPS, password hashing, JWT sessions, input validation).

## Modularity
The platform is designed to be easily extensible for future additions like Online Counselling, Application Tracking, and Premium Memberships without requiring a complete rewrite.
