# Loan Manager Web

Loan Manager Web is a MERN-stack loan management application for individual lenders and small businesses. It includes owner authentication, customer profiles, loan tracking, interest calculations, installment recording, ledger entries, reminders, reports, document uploads, and offline-first behavior for mobile use.

## Stack

- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express.js
- Database: MongoDB with Mongoose
- PWA: Manifest + service worker for installable mobile usage

## Project structure

```text
loan-manager-web/
  frontend/
    public/
    src/
      components/
      pages/
        Dashboard/
        Customers/
        Loans/
        Payments/
        Ledger/
        Reports/
  backend/
    src/
      config/
      controllers/
      middleware/
      models/
      routes/
      services/
    uploads/
```

## Features

- Owner-only login
- Customer create, edit, delete and profile view
- Document upload support for Aadhaar, PAN and other files
- Loan creation with simple, compound, monthly and daily interest
- Installment recording with balance updates
- Khata ledger for debit and credit entries
- Dashboard cards and recent payment feed
- Reports for issued loans, interest earned, pending payments and overdue customers
- Search and filters
- Offline-first local storage persistence
- Mobile responsive layout with installable PWA setup

## Run locally

### 1. Install dependencies

```bash
cd frontend
npm install
```

```bash
cd backend
npm install
```

### 2. Configure backend environment

Copy [backend/.env.example](/d:/2026/ladegerApp/loan-manager-app/backend/.env.example) to `backend/.env` and update values if needed.

Default local owner credentials:

- Phone: `9999999999`
- Password: `admin123`

### 3. Start MongoDB

Make sure MongoDB is running locally on `mongodb://127.0.0.1:27017`.

### 4. Start the backend

```bash
cd backend
npm run dev
```

### 5. Start the frontend

```bash
cd frontend
npm run dev
```

Open `http://localhost:5173`.

## Deploy for free

Best free stack for this project:

- Frontend: Vercel Hobby
- Backend: Render Free Web Service
- Database: MongoDB Atlas M0

Tradeoff:

- Render free services sleep after inactivity, so the backend will have cold starts.

### 1. MongoDB Atlas

Create a free Atlas cluster and copy the connection string.

Example:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/loan-manager-web
```

### 2. Deploy backend on Render

Create a new `Web Service` from this repo/folder.

You can also let Render detect [render.yaml](/d:/2026/ladegerApp/loan-manager-app/render.yaml).

Settings:

- Root directory: `backend`
- Environment: `Node`
- Build command: `npm install`
- Start command: `npm start`

Set these environment variables in Render:

```env
PORT=10000
MONGODB_URI=your-atlas-uri
JWT_SECRET=use-a-long-random-secret
OWNER_NAME=Owner
OWNER_PHONE=9999999999
OWNER_PASSWORD=admin123
CLIENT_URL=https://your-vercel-app.vercel.app
```

Important:

- After Render gives you a backend URL, update Atlas Network Access if needed.
- If using Cloudinary, also add `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`.

### 3. Deploy frontend on Vercel

Create a new Vercel project.

The frontend also includes [frontend/vercel.json](/d:/2026/ladegerApp/loan-manager-app/frontend/vercel.json) so Vercel can pick up the expected Vite build settings.

Settings:

- Root directory: `frontend`
- Framework preset: `Vite`
- Build command: `npm run build`
- Output directory: `dist`

Set this environment variable in Vercel:

```env
VITE_API_URL=https://your-render-service.onrender.com/api
```

The frontend env template is in [frontend/.env.example](/d:/2026/ladegerApp/loan-manager-app/frontend/.env.example).

### 4. Update CORS

Your backend `CLIENT_URL` should contain your Vercel domain.

Example:

```env
CLIENT_URL=https://your-vercel-app.vercel.app
```

If you later use a custom domain, update this value in Render.

### 5. First production test

After deployment:

1. Open the Vercel app URL.
2. Login with the owner credentials from Render env vars.
3. Check that dashboard, customers, loans, payments, ledger, and reports all load.
4. Create one customer and one loan to confirm frontend-to-backend connectivity.

### Recommended order

1. Deploy backend on Render.
2. Copy Render backend URL.
3. Set `VITE_API_URL` in Vercel.
4. Deploy frontend on Vercel.
5. Test login and API calls.

## Push to GitHub

If you have already created an empty GitHub repository, run:

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

If you prefer SSH:

```bash
git remote add origin git@github.com:YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

## API endpoints

- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET|POST /api/customers`
- `GET|PUT|DELETE /api/customers/:id`
- `GET|POST /api/loans`
- `GET /api/loans/:id`
- `GET|POST /api/payments`
- `GET|POST /api/ledger`
- `GET /api/dashboard`
- `GET /api/reports`

## Offline mode

The frontend stores the application state in browser local storage so the app continues to work without connectivity. When the backend is unavailable, login falls back to the seeded local owner account and the app remains usable as a standalone PWA.
