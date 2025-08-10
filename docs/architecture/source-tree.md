# Project Source Tree

## Root Structure
```
AI-Marketing-Web-Builder/
├── backend/                    # FastAPI backend service
├── web-builder/               # Next.js frontend application
├── bmad/                      # BMad Method framework
├── docs/                      # Project documentation
└── scripts/                   # Utility scripts
```

## Backend Structure (/backend/)
```
backend/
├── app/
│   ├── api/v1/endpoints/     # API endpoints
│   ├── models/               # Database models
│   ├── services/             # Business logic
│   └── main.py              # FastAPI app
├── requirements.txt         # Python dependencies
└── docker-compose.yml       # Backend services
```

## Frontend Structure (/web-builder/)
```
web-builder/
├── src/
│   ├── app/                 # Next.js app router pages
│   ├── components/          # React components
│   ├── lib/                 # Utilities and helpers
│   └── types/               # TypeScript definitions
├── package.json             # Node dependencies
└── next.config.ts           # Next.js configuration
```

## Key Directories
- **Components**: Reusable UI components in `/web-builder/src/components/`
- **API Routes**: Backend endpoints in `/backend/app/api/v1/endpoints/`
- **Models**: Database models in `/backend/app/models/`
- **Services**: Business logic in `/backend/app/services/`