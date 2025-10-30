# Project Structure

## Root Structure
```bash
volunteerhub/
├── backend/                      # Express + TypeScript + MongoDB
├── frontend/                     # React + TypeScript + Vite
├── docs/                         # Documentation, OpenAPI, diagrams
├── docker/                       # Docker setup for each service
├── scripts/                      # CI/CD, seeding, utilities
├── .editorconfig
├── .eslintrc.json
├── .prettierrc
├── docker-compose.yml
├── package.json                  # Root-level (optional monorepo)
├── tsconfig.base.json            # Shared TS config across backend/frontend
└── README.md
```

## Backend Structure
```bash
backend/
├── src/
│   ├── app.ts                   # Express app setup
│   ├── server.ts                # Entry point
│   │
│   ├── config/                  # App configuration
│   │
│   ├── domain/                  # Business entities & repository contracts
│   │   ├── entities/
│   │   └── repositories/
│   │
│   ├── infrastructure/          # Implementations (Mongo, external services)
│   │   ├── repositories/        # Concrete repo implementations
│   │   ├── externals/            # Infrastructure services (email, cache)
│   │   └── database/            # DB init, seeding, migrations (if any)
│   │
│   ├── application/             # Use cases / business logic
│   │   ├── dtos/
│   │   └── services/
│   │
│   ├── presentation/            # HTTP API Layer
│   │   ├── controllers/
│   │   ├── routes/
│   │   └── validators/          # Zod or Joi schemas
│   │
│   ├── middlewares/             # Shared middlewares
│   │
│   ├── utils/                   # Generic helpers
│   │
│   └── tests/
│       ├── unit/
│       └── integration/
│
├── tsconfig.json
├── package.json
├── jest.config.ts
├── Dockerfile
├── .gitignore
└── .env
```

## Frontend Structure
```bash
frontend/
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   │
│   ├── components/              # Reusable components
│   │
│   ├── pages/
│   │
│   ├── routes/
│   │
│   ├── store/                   # Zustand / Redux Toolkit
│   │
│   ├── hooks/
│   │
│   ├── utils/
│   │
│   ├── assets/                  # Images, icons, fonts
│   │
│   ├── styles/
│   │
│   └── types/
│
├── vite.config.ts
├── tailwind.config.js 
├── tsconfig.json
├── package.json
├── .gitignore
├── .env
└── Dockerfile
```