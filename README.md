# 🌱 SmartSeason — Field Monitoring System

A full-stack web application for tracking crop progress across multiple fields during a growing season. Built as part of an internship technical assessment.

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)
![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react&logoColor=black)
![SQLite](https://img.shields.io/badge/SQLite-3-003B57?logo=sqlite&logoColor=white)

---

## 📋 Project Overview

SmartSeason allows agricultural coordinators (Admins) and field workers (Field Agents) to monitor and manage crop fields throughout the growing season. The system tracks field lifecycle stages, calculates risk statuses, and provides dashboard analytics.

### User Roles

| Role | Capabilities |
|------|-------------|
| **Admin / Coordinator** | Create, edit, delete fields · Assign agents · View all fields · Dashboard with full stats · Manage users |
| **Field Agent** | View assigned fields · Submit stage updates with notes · Personal dashboard with assigned field stats |

### Field Lifecycle

```
Planted → Growing → Ready → Harvested
```

### Computed Status Logic

| Status | Condition |
|--------|-----------|
| **Active** | Field is on schedule based on crop growth timelines |
| **At Risk** | Field's stage is behind the expected timeline for its crop type |
| **Completed** | Field has been harvested |

---

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.x
- **ORM**: Sequelize 6 (with SQLite for development)
- **Authentication**: JWT (jsonwebtoken + bcryptjs)
- **Validation**: express-validator
- **Database**: SQLite (dev) / PostgreSQL (production)

### Frontend
- **Framework**: React 18+ (Vite)
- **Routing**: React Router v6
- **Styling**: Vanilla CSS with CSS Custom Properties
- **Charts**: Chart.js via react-chartjs-2

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18 or higher
- npm 9 or higher

### 1. Clone the Repository

```bash
git clone <repository-url>
cd smartseason
```

### 2. Backend Setup

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Seed the database with demo data
npm run seed

# Start the backend server (development)
npm run dev
```

The API will be available at `http://localhost:5000`.

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be available at `http://localhost:5173`.

---

## 🔑 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@smartseason.com | admin123 |
| **Field Agent 1** | john@smartseason.com | agent123 |
| **Field Agent 2** | sarah@smartseason.com | agent123 |

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | Login & get JWT | Public |
| GET | `/api/auth/me` | Get current user profile | Bearer |

### Users (Admin Only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List all users |
| GET | `/api/users/:id` | Get user by ID |
| PUT | `/api/users/:id` | Update user |
| DELETE | `/api/users/:id` | Delete user |

### Fields
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/fields` | Create field | Admin |
| GET | `/api/fields` | List fields (role-filtered) | Any |
| GET | `/api/fields/:id` | Get field with update history | Any |
| PUT | `/api/fields/:id` | Update field details | Admin |
| DELETE | `/api/fields/:id` | Delete field | Admin |
| PUT | `/api/fields/:id/assign` | Assign agent to field | Admin |
| POST | `/api/fields/:id/updates` | Add stage update | Agent/Admin |
| GET | `/api/fields/:id/updates` | Get field's update history | Any |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/stats` | Aggregated statistics |
| GET | `/api/dashboard/recent-updates` | Recent field updates |

---

## 🏗️ Design Decisions

### 1. SQLite for Development
SQLite requires zero setup and creates a simple file-based database. The Sequelize ORM abstracts the database layer, making it easy to switch to PostgreSQL for production by updating `.env`.

### 2. Computed Status via Crop Timelines
Field status ("Active", "At Risk", "Completed") is computed dynamically based on configurable crop growth timelines (`config/cropTimelines.js`). Each crop type defines expected days for stage transitions, making the system adaptable to different agricultural contexts.

### 3. Immutable Field Updates
Field updates are append-only (immutable log). Each update records who made it, the new stage, notes, and a timestamp. This provides a complete audit trail of field progression.

### 4. Stage Progression Validation
Field agents cannot reverse stages (e.g., move from "growing" back to "planted"). Only admins can override this restriction, preventing accidental data corruption.

### 5. Role-Based Data Filtering
Rather than separate endpoints for admins and agents, the same endpoints return role-appropriate data. Admins see all fields; agents see only their assigned fields.

---

## 📁 Project Structure

```
smartseason/
├── config/
│   ├── auth.js              # JWT configuration
│   ├── cropTimelines.js     # Crop growth timeline definitions
│   └── database.js          # Sequelize database config
├── controllers/
│   ├── authController.js    # Registration, login, profile
│   ├── dashboardController.js # Stats aggregation
│   ├── fieldController.js   # Field CRUD, assignment, updates
│   └── userController.js    # User management (admin)
├── middleware/
│   ├── auth.js              # JWT verification
│   ├── errorHandler.js      # Global error handler
│   └── roleCheck.js         # Role-based access control
├── models/
│   ├── Field.js             # Field model
│   ├── FieldUpdate.js       # Field update model
│   ├── User.js              # User model with password hashing
│   └── index.js             # Model associations
├── routes/
│   ├── auth.js              # Auth routes
│   ├── dashboard.js         # Dashboard routes
│   ├── fields.js            # Field routes
│   └── users.js             # User routes
├── utils/
│   ├── seedData.js          # Demo data seeder
│   └── statusCalculator.js  # Field status computation
├── frontend/                # React frontend (Vite)
├── .env.example
├── .gitignore
├── package.json
├── server.js                # Express entry point
└── README.md
```

---

## 🧪 Assumptions

1. **Single Agent Assignment**: Each field is assigned to at most one field agent at a time.
2. **Stage Progression**: Stages follow a linear progression (planted → growing → ready → harvested). Reversal is only allowed by admins.
3. **"At Risk" Definition**: A field is considered "at risk" when it has been in its current stage longer than the expected timeline for its crop type (defined in `config/cropTimelines.js`).
4. **Crop Timelines**: Default timelines are provided for common crops. Unlisted crop types use a generic default timeline.
5. **Status Recalculation**: Field status is recalculated on every read operation to ensure it reflects the current date.

---

## 📄 License

ISC
