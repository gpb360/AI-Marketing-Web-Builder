# AI Marketing Web Builder - Technical Architecture

## Overview
Clean architecture with separated frontend and backend for independent development, deployment, and scaling.

## System Architecture

### Backend (FastAPI)
- **Location**: `/backend/`
- **Port**: 8000
- **Framework**: FastAPI + SQLAlchemy
- **Database**: PostgreSQL (production), SQLite (development)
- **Features**: Authentication, CRM, Templates, Workflows, Publishing, Collaboration

### Frontend (Next.js)
- **Location**: `/web-builder/`
- **Port**: 3000
- **Framework**: Next.js 14 + React
- **UI**: Tailwind CSS + shadcn/ui
- **Features**: Visual Builder, Template System, Real-time Collaboration

### Communication
- **API**: REST endpoints at `/api/v1/`
- **Real-time**: WebSocket for collaboration
- **Auth**: JWT tokens

## Development Workflow
- **Backend**: `cd backend && uvicorn app.main:app --reload`
- **Frontend**: `cd web-builder && npm run dev`
- **Full Stack**: Run both services concurrently

## Key Principles
1. Clean separation between frontend and backend
2. Independent deployment and scaling
3. API-first communication
4. No cross-contamination of concerns