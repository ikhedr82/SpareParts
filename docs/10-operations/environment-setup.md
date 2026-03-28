# Environment Setup

## Development Environment

### Prerequisites
| Tool | Version | Purpose |
|---|---|---|
| Node.js | ≥ 18.x | Runtime |
| npm | ≥ 9.x | Package manager |
| PostgreSQL | ≥ 14.x | Database |
| Git | Latest | Version control |
| Expo CLI | Latest | Mobile app development |

### 1. Clone Repository
```bash
git clone https://github.com/ikhedr82/SpareParts.git
cd SpareParts
```

### 2. Backend Setup
```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your local database credentials

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed data
npx ts-node src/prisma/seed-cms.ts

# Start development server
npm run start:dev
```
Backend runs on: `http://localhost:3000`

### 3. Frontend Setup (Tenant Admin / Customer Portal)
```bash
cd frontend
npm install

# Configure environment
echo "NEXT_PUBLIC_API_URL=http://localhost:3000" > .env.local

# Start development server
npm run dev
```
Frontend runs on: `http://localhost:3001`

### 4. Admin Panel Setup
```bash
cd admin-panel
npm install
npm run dev
```
Admin panel runs on: `http://localhost:3002`

### 5. Mobile App Setup
```bash
cd mobile-app
npm install
npx expo start
```
Scan the QR code with Expo Go app on your device.

## Environment Variable Reference

### Backend (.env)
| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/partivo` |
| `JWT_SECRET` | Secret for signing JWT tokens | `super-secret-key-min-32-chars` |
| `STRIPE_SECRET_KEY` | Stripe API secret key | `sk_test_xxx` |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | `whsec_xxx` |

### Frontend (.env.local)
| Variable | Description | Example |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:3000` |
