# Plan to Get Application Up and Running with Backend and Frontend Connected

## 1. Overview

This document outlines a comprehensive plan to get the AI Marketing Web Builder application up and running with both backend and frontend services properly connected. The plan includes steps to verify the current state, fix any connectivity issues, and establish a process for checking Archon tasks and uploading BMAD tasks.

## 2. Current System Architecture

### 2.1 Technology Stack

**Backend:**
- FastAPI (Python)
- SQLite database (development)
- Uvicorn ASGI server
- Port: 8000

**Frontend:**
- Next.js 15
- React
- TypeScript
- Tailwind CSS
- Port: 3003

### 2.2 Communication Flow

```
┌─────────────────┐    HTTP API    ┌─────────────────┐
│   Frontend      │◄──────────────►│    Backend      │
│   (Next.js)     │    Port 3003   │   (FastAPI)     │
│   Port 3003     │                │   Port 8000     │
└─────────────────┘                └─────────────────┘
```

## 3. Application Startup Plan

### 3.1 Backend Setup and Verification

#### Step 1: Environment Configuration
- Verify `.env` file exists in `backend/` directory
- Ensure database URL is correctly configured
- Check that `SECRET_KEY` is set for development

#### Step 2: Dependency Installation
```bash
cd backend
pip install -r requirements.txt
```

#### Step 3: Database Initialization
```bash
cd backend
alembic upgrade head
```

#### Step 4: Start Backend Server
```bash
cd backend
python test_basic.py
# Or for full API:
# uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Step 5: Verify Backend Health
- Access `http://localhost:8000/health` to confirm backend is running
- Check `http://localhost:8000/docs` for API documentation

### 3.2 Frontend Setup and Verification

#### Step 1: Dependency Installation
```bash
cd web-builder
npm install
# Or if using pnpm:
# pnpm install
```

#### Step 2: Environment Configuration
- Verify `.env.local` exists with correct API URL:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

#### Step 3: Start Frontend Server
```bash
cd web-builder
npm run dev
# Runs on port 3003 as configured
```

#### Step 4: Verify Frontend Access
- Access `http://localhost:3003` to confirm frontend is running
- Check browser console for any connection errors

### 3.3 Integration Verification

#### Step 1: Test API Connectivity
- Use the built-in API testing utilities in the frontend
- Verify authentication endpoints work correctly
- Test template and workflow API endpoints

#### Step 2: Create Test User
```bash
cd backend
python create_test_user.py
```

#### Step 3: Test Authentication Flow
- Navigate to login page in frontend
- Attempt login with test user credentials
- Verify successful authentication and token handling

## 4. Archon Task Management Process

### 4.1 Checking Current Tasks
Before any development work:
1. Check existing Archon tasks:
   ```bash
   archon:manage_task(action="list", filter_by="project", filter_value="[project_id]")
   ```
2. Identify next priority task:
   ```bash
   archon:manage_task(action="list", filter_by="status", filter_value="todo", project_id="[project_id]")
   ```

### 4.2 Task Execution Workflow
For each task:
1. Get task details:
   ```bash
   archon:manage_task(action="get", task_id="[current_task_id]")
   ```
2. Update task status to "doing":
   ```bash
   archon:manage_task(action="update", task_id="[current_task_id]", update_fields={"status": "doing"})
   ```
3. Conduct research and implementation
4. Update task status to "review" when complete:
   ```bash
   archon:manage_task(action="update", task_id="[current_task_id]", update_fields={"status": "review"})
   ```

### 4.3 BMAD Task Upload Process
After completing work:
1. Create a feature branch for changes
2. Commit all changes with conventional commit messages
3. Create Pull Request via GitHub MCP:
   ```bash
   mcp__github__create_pull_request(
     owner="gpb360",
     repo="AI-Marketing-Web-Builder", 
     title="[TASK-ID] Feature Description",
     head="feature/task-{id}-{desc}",
     base="main",
     body="Completes Archon task {task-id}\n\n{detailed description}"
   )
   ```
4. Update Archon task with PR URL:
   ```bash
   archon:manage_task(
     action="update",
     task_id="...",
     update_fields={
       "status": "review",
       "pr_url": "https://github.com/gpb360/AI-Marketing-Web-Builder/pull/{pr_number}"
     }
   )
   ```

## 5. Supabase Migration Assessment

### 5.1 Current Database Architecture
The application currently uses:
- SQLite for development
- SQLAlchemy ORM for database abstraction
- Alembic for migrations

### 5.2 Supabase Integration Requirements
To migrate to Supabase, we would need to:

#### Backend Changes:
1. Update database configuration in `backend/app/core/config.py`:
   ```python
   DATABASE_URL: str = "postgresql://user:password@host:port/database"
   ```

2. Install PostgreSQL driver:
   ```bash
   pip install asyncpg
   ```

3. Update database session configuration in `backend/app/db/session.py`

4. Verify all models are compatible with PostgreSQL

#### Frontend Changes:
Minimal changes required as Supabase provides a REST API that can be accessed through existing API client.

### 5.3 Migration Effort Estimation
**Effort Level: Medium**
- Time estimate: 2-3 days for basic migration
- Additional time for testing and optimization: 1-2 days

**Key Tasks:**
1. Set up Supabase project and database
2. Update backend database configuration
3. Test all existing API endpoints
4. Update migration and deployment scripts
5. Comprehensive testing of all features

## 6. Troubleshooting Common Issues

### 6.1 Backend Connection Issues
- **Symptom**: Frontend shows "Failed to fetch" errors
- **Solution**: 
  1. Verify backend is running on port 8000
  2. Check CORS configuration in `backend/app/core/config.py`
  3. Ensure `ALLOWED_ORIGINS` includes `http://localhost:3003`

### 6.2 Database Connection Issues
- **Symptom**: Backend fails to start with database errors
- **Solution**:
  1. Verify database URL in `.env` file
  2. Ensure database service is running
  3. Check database credentials

### 6.3 Authentication Issues
- **Symptom**: Login fails with "Incorrect email or password"
- **Solution**:
  1. Verify test user exists in database
  2. Check password hashing implementation
  3. Confirm JWT secret configuration

## 7. Testing and Validation

### 7.1 Automated Testing
Run backend tests:
```bash
cd backend
pytest
```

Run frontend tests:
```bash
cd web-builder
npm test
```

### 7.2 Manual Testing
1. Verify homepage loads correctly
2. Test user registration flow
3. Test user login/logout
4. Verify template browsing functionality
5. Test workflow creation features
6. Check migration wizard functionality

## 8. Deployment Validation

### 8.1 Development Environment
- Both services start without errors
- API endpoints respond correctly
- Frontend displays without errors
- Authentication works end-to-end

### 8.2 Integration Points
- Template service integration
- Workflow service integration
- CRM service integration
- Migration service integration

## 9. Next Steps

1. Execute the startup plan to get both services running
2. Verify integration between frontend and backend
3. Create test users for authentication testing
4. Document any issues encountered and solutions
5. Assess Supabase migration requirements in detail
6. Create Archon tasks for Supabase migration if approved- FastAPI (Python)
- SQLite database (development)
- Uvicorn ASGI server
- Port: 8000

**Frontend:**
- Next.js 15
- React
- TypeScript
- Tailwind CSS
- Port: 3003

### 2.2 Communication Flow

```
┌─────────────────┐    HTTP API    ┌─────────────────┐
│   Frontend      │◄──────────────►│    Backend      │
│   (Next.js)     │    Port 3003   │   (FastAPI)     │
│   Port 3003     │                │   Port 8000     │
└─────────────────┘                └─────────────────┘
```

## 3. Application Startup Plan

### 3.1 Backend Setup and Verification

#### Step 1: Environment Configuration
- Verify `.env` file exists in `backend/` directory
- Ensure database URL is correctly configured
- Check that `SECRET_KEY` is set for development

#### Step 2: Dependency Installation
```bash
cd backend
pip install -r requirements.txt
```

#### Step 3: Database Initialization
```bash
cd backend
alembic upgrade head
```

#### Step 4: Start Backend Server
```bash
cd backend
python test_basic.py
# Or for full API:
# uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Step 5: Verify Backend Health
- Access `http://localhost:8000/health` to confirm backend is running
- Check `http://localhost:8000/docs` for API documentation

### 3.2 Frontend Setup and Verification

#### Step 1: Dependency Installation
```bash
cd web-builder
npm install
# Or if using pnpm:
# pnpm install
```

#### Step 2: Environment Configuration
- Verify `.env.local` exists with correct API URL:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

#### Step 3: Start Frontend Server
```bash
cd web-builder
npm run dev
# Runs on port 3003 as configured
```

#### Step 4: Verify Frontend Access
- Access `http://localhost:3003` to confirm frontend is running
- Check browser console for any connection errors

### 3.3 Integration Verification

#### Step 1: Test API Connectivity
- Use the built-in API testing utilities in the frontend
- Verify authentication endpoints work correctly
- Test template and workflow API endpoints

#### Step 2: Create Test User
```bash
cd backend
python create_test_user.py
```

#### Step 3: Test Authentication Flow
- Navigate to login page in frontend
- Attempt login with test user credentials
- Verify successful authentication and token handling

## 4. Archon Task Management Process

### 4.1 Checking Current Tasks
Before any development work:
1. Check existing Archon tasks:
   ```bash
   archon:manage_task(action="list", filter_by="project", filter_value="[project_id]")
   ```
2. Identify next priority task:
   ```bash
   archon:manage_task(action="list", filter_by="status", filter_value="todo", project_id="[project_id]")
   ```

### 4.2 Task Execution Workflow
For each task:
1. Get task details:
   ```bash
   archon:manage_task(action="get", task_id="[current_task_id]")
   ```
2. Update task status to "doing":
   ```bash
   archon:manage_task(action="update", task_id="[current_task_id]", update_fields={"status": "doing"})
   ```
3. Conduct research and implementation
4. Update task status to "review" when complete:
   ```bash
   archon:manage_task(action="update", task_id="[current_task_id]", update_fields={"status": "review"})
   ```

### 4.3 BMAD Task Upload Process
After completing work:
1. Create a feature branch for changes
2. Commit all changes with conventional commit messages
3. Create Pull Request via GitHub MCP:
   ```bash
   mcp__github__create_pull_request(
     owner="gpb360",
     repo="AI-Marketing-Web-Builder", 
     title="[TASK-ID] Feature Description",
     head="feature/task-{id}-{desc}",
     base="main",
     body="Completes Archon task {task-id}

{detailed description}"
   )
   ```
4. Update Archon task with PR URL:
   ```bash
   archon:manage_task(
     action="update",
     task_id="...",
     update_fields={
       "status": "review",
       "pr_url": "https://github.com/gpb360/AI-Marketing-Web-Builder/pull/{pr_number}"
     }
   )
   ```

## 5. Supabase Migration Assessment

### 5.1 Current Database Architecture
The application currently uses:
- SQLite for development
- SQLAlchemy ORM for database abstraction
- Alembic for migrations

### 5.2 Supabase Integration Requirements
To migrate to Supabase, we would need to:

#### Backend Changes:
1. Update database configuration in `backend/app/core/config.py`:
   ```python
   DATABASE_URL: str = "postgresql://user:password@host:port/database"
   ```

2. Install PostgreSQL driver:
   ```bash
   pip install asyncpg
   ```

3. Update database session configuration in `backend/app/db/session.py`

4. Verify all models are compatible with PostgreSQL

#### Frontend Changes:
Minimal changes required as Supabase provides a REST API that can be accessed through existing API client.

### 5.3 Migration Effort Estimation
**Effort Level: Medium**
- Time estimate: 2-3 days for basic migration
- Additional time for testing and optimization: 1-2 days

**Key Tasks:**
1. Set up Supabase project and database
2. Update backend database configuration
3. Test all existing API endpoints
4. Update migration and deployment scripts
5. Comprehensive testing of all features

## 6. Troubleshooting Common Issues

### 6.1 Backend Connection Issues
- **Symptom**: Frontend shows "Failed to fetch" errors
- **Solution**: 
  1. Verify backend is running on port 8000
  2. Check CORS configuration in `backend/app/core/config.py`
  3. Ensure `ALLOWED_ORIGINS` includes `http://localhost:3003`

### 6.2 Database Connection Issues
- **Symptom**: Backend fails to start with database errors
- **Solution**:
  1. Verify database URL in `.env` file
  2. Ensure database service is running
  3. Check database credentials

### 6.3 Authentication Issues
- **Symptom**: Login fails with "Incorrect email or password"
- **Solution**:
  1. Verify test user exists in database
  2. Check password hashing implementation
  3. Confirm JWT secret configuration

## 7. Testing and Validation

### 7.1 Automated Testing
Run backend tests:
```bash
cd backend
pytest
```

Run frontend tests:
```bash
cd web-builder
npm test
```

### 7.2 Manual Testing
1. Verify homepage loads correctly
2. Test user registration flow
3. Test user login/logout
4. Verify template browsing functionality
5. Test workflow creation features
6. Check migration wizard functionality

## 8. Deployment Validation

### 8.1 Development Environment
- Both services start without errors
- API endpoints respond correctly
- Frontend displays without errors
- Authentication works end-to-end

### 8.2 Integration Points
- Template service integration
- Workflow service integration
- CRM service integration
- Migration service integration

## 9. Next Steps

1. Execute the startup plan to get both services running
2. Verify integration between frontend and backend
3. Create test users for authentication testing
4. Document any issues encountered and solutions
5. Assess Supabase migration requirements in detail
6. Create Archon tasks for Supabase migration if approved




















































































































































































































































































