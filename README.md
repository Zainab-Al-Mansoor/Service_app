# ServiceHub - On-Demand Service Application

A full-stack on-demand service platform similar to Urban Company or Uber for services. Users can browse services, book appointments, and track bookings. Service providers can manage their services and accept/reject jobs. Admins can manage users, services, categories, and bookings.

## Tech Stack

### Frontend
- **Next.js 13** (App Router) - React framework for the web application
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful, accessible UI components
- **Lucide React** - Beautiful & consistent icons

### Backend
- **Node.js** with **Express** - RESTful API server
- **TypeScript** - Type-safe backend code
- **MySQL** - Relational database
- **Sequelize** - ORM for MySQL
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing

## Project Structure

```
├── backend/                        # Backend API (Node.js + Express)
│   ├── src/
│   │   ├── config/
│   │   │   └── database.ts         # MySQL connection config
│   │   ├── controllers/
│   │   │   ├── authController.ts   # Auth endpoints
│   │   │   ├── userController.ts   # User management
│   │   │   ├── serviceController.ts # Service management
│   │   │   └── bookingController.ts # Booking management
│   │   ├── middleware/
│   │   │   ├── auth.ts              # JWT authentication
│   │   │   ├── errorHandler.ts     # Error handling
│   │   │   └── validate.ts          # Request validation
│   │   ├── models/
│   │   │   ├── User.ts              # User model
│   │   │   ├── Role.ts              # Role model
│   │   │   ├── Service.ts           # Service model
│   │   │   ├── Category.ts          # Category model
│   │   │   ├── Booking.ts           # Booking model
│   │   │   ├── ProviderAvailability.ts
│   │   │   └── Review.ts
│   │   ├── routes/
│   │   │   ├── authRoutes.ts
│   │   │   ├── userRoutes.ts
│   │   │   ├── serviceRoutes.ts
│   │   │   └── bookingRoutes.ts
│   │   ├── utils/
│   │   │   ├── jwt.ts               # JWT utilities
│   │   │   └── password.ts          # Password utilities
│   │   ├── scripts/
│   │   │   └── initDatabase.ts      # DB init script
│   │   └── server.ts                # Entry point
│   ├── package.json
│   └── .env.example
├── app/                            # Next.js frontend
│   ├── page.tsx                    # Landing page
│   ├── login/                      # Login page
│   ├── signup/                     # Registration page
│   ├── customer/                    # Customer portal
│   │   ├── page.tsx                # Browse services
│   │   ├── bookings/              # My bookings
│   │   ├── book/[id]/              # Book a service
│   │   └── profile/                # Profile settings
│   ├── provider/                   # Provider portal
│   │   ├── page.tsx               # Dashboard
│   │   ├── services/              # Manage services
│   │   ├── bookings/              # Manage bookings
│   │   └── profile/               # Profile & availability
│   └── admin/                       # Admin panel
│       ├── page.tsx               # Dashboard
│       ├── users/                 # User management
│       ├── services/              # Service management
│       ├── bookings/              # Booking management
│       └── categories/            # Category management
├── components/ui/                  # shadcn/ui components
├── hooks/
│   └── use-auth.tsx               # Authentication hook
├── lib/
│   ├── api-client.ts              # API client
│   ├── query-provider.tsx         # React Query provider
│   └── utils.ts                   # Utility functions
├── schema.sql                     # MySQL schema
└── README.md
```

## Database Schema

### Tables

#### `roles`
Contains user roles.
```sql
id (UUID, PRIMARY KEY)
role_name (ENUM: customer, provider, admin)
description
created_at, updated_at
```

#### `users`
User accounts with role association.
```sql
id (UUID, PRIMARY KEY)
email (VARCHAR, UNIQUE)
password (VARCHAR, hashed)
full_name, phone, avatar_url
role_id (FK to roles)
is_verified, is_active
created_at, updated_at
```

#### `categories`
Service categories.
```sql
id (UUID, PRIMARY KEY)
name (VARCHAR, UNIQUE)
description
icon_url
is_active
sort_order
created_at, updated_at
```

#### `services`
Services offered by providers.
```sql
id (UUID, PRIMARY KEY)
provider_id (FK to users)
category_id (FK to categories)
name, description
price (DECIMAL)
duration_minutes (INT)
image_url
is_active
created_at, updated_at
```

#### `bookings`
Customer booking requests.
```sql
id (UUID, PRIMARY KEY)
customer_id, service_id, provider_id (FKs)
scheduled_date (DATE)
scheduled_time (TIME)
status (ENUM: pending, accepted, rejected, in_progress, completed, cancelled)
address, notes
total_amount (DECIMAL)
cancellation_reason
created_at, updated_at
```

#### `provider_availability`
Provider's weekly availability.
```sql
id (UUID, PRIMARY KEY)
provider_id (FK to users)
day_of_week (0-6)
start_time, end_time (TIME)
is_available
created_at, updated_at
```

#### `reviews`
Customer reviews for completed bookings.
```sql
id (UUID, PRIMARY KEY)
booking_id (FK to bookings, UNIQUE)
customer_id, provider_id (FKs)
rating (1-5)
comment
created_at
```

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update profile |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | Get all users (admin) |
| GET | `/api/users/:id` | Get user by ID (admin) |
| PUT | `/api/users/:id/status` | Update user status (admin) |
| GET | `/api/users/stats/dashboard` | Admin dashboard stats |
| GET | `/api/users/providers/list` | List all providers |

### Services
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/services` | Get all services |
| GET | `/api/services/:id` | Get service by ID |
| POST | `/api/services` | Create service (provider) |
| PUT | `/api/services/:id` | Update service (provider) |
| DELETE | `/api/services/:id` | Delete service (provider) |
| GET | `/api/services/categories` | Get categories |
| POST | `/api/services/categories` | Create category (admin) |
| PUT | `/api/services/categories/:id` | Update category (admin) |

### Bookings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/bookings` | Get bookings (role-filtered) |
| GET | `/api/bookings/:id` | Get booking by ID |
| POST | `/api/bookings` | Create booking (customer) |
| PUT | `/api/bookings/:id/status` | Update status (provider) |
| POST | `/api/bookings/:id/cancel` | Cancel booking (customer) |
| GET | `/api/bookings/stats/provider` | Provider stats |
| GET | `/api/bookings/stats/customer` | Customer stats |

## Setup Instructions

### Prerequisites
- Node.js 18+
- MySQL 8.0+ installed and running
- npm or yarn

### Step 1: Clone/Download the Repository

### Step 2: Setup MySQL Database

1. Create a MySQL database:
```sql
CREATE DATABASE ondemand_service_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. Or run the provided schema file:
```bash
mysql -u root -p < schema.sql
```

### Step 3: Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your MySQL credentials:
# DB_HOST=localhost
# DB_USER=root
# DB_PASSWORD=root
# DB_NAME=ondemand_service_db
# DB_PORT=3306
# JWT_SECRET=your_super_secret_key
# JWT_EXPIRES_IN=7d
# PORT=5000

# Initialize database (optional - creates roles and categories)
npm run init-db

# Start development server
npm run dev
```

### Step 4: Frontend Setup

Open a new terminal:

```bash
# In project root
npm install

# Copy environment file
cp .env.example .env

# Edit .env:
# NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Start development server
npm run dev
```

### Step 5: Create Admin Account

1. Register through the app or via API:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123456","full_name":"Admin User","role":"customer"}'
```

2. Update the user to admin role in MySQL:
```sql
UPDATE users u
JOIN roles r ON r.role_name = 'admin'
SET u.role_id = r.id, u.is_verified = TRUE
WHERE u.email = 'admin@example.com';
```

## Sample Credentials

After running `npm run init-db`:

### Admin Account
- Email: `admin@servicehub.com`
- Password: `Admin@123`

### Test Flow
1. Create a customer account at `/signup`
2. Create a provider account at `/signup?role=provider`
3. As provider: add services at `/provider/services`
4. As customer: browse and book services at `/customer`
5. As provider: accept the booking at `/provider/bookings`
6. As admin: manage everything at `/admin`

## Production Deployment

### Backend
1. Build: `npm run build`
2. Start: `npm start`
3. Use PM2 or similar for process management

### Frontend
1. Build: `npm run build`
2. Deploy to Vercel, Netlify, or any Node hosting

### Environment Variables (Production)

Backend `.env`:
```
NODE_ENV=production
DB_HOST=your-mysql-host
DB_USER=root
DB_PASSWORD=your-secure-password
DB_NAME=ondemand_service_db
JWT_SECRET=use-a-very-secure-random-string
```

Frontend `.env`:
```
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api
```

## Technology Choices

| Layer | Technology | Reason |
|-------|------------|--------|
| Frontend | Next.js 13 | SSR, App Router, API routes |
| Styling | Tailwind CSS | Rapid UI development |
| UI Components | shadcn/ui | Accessible, customizable |
| Backend | Express.js | Lightweight, flexible Node framework |
| Database | MySQL | ACID compliant, relational data |
| ORM | Sequelize | TypeScript support, migrations |
| Auth | JWT | Stateless, scalable |
| Password | bcryptjs | Industry standard hashing |

## License

MIT License - Free to use and modify.
