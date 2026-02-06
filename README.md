# Ticketer - Event Ticket Management System

## Setup Complete

All compilation errors have been resolved! The project uses **Appwrite** as the database backend.

## What Was Fixed
1. **Created `package.json`** - Added all required dependencies:
   - next (v14.1.0)
   - react & react-dom
   - node-appwrite
   - TypeScript and type definitions

2. **Created `tsconfig.json`** - TypeScript configuration with proper module resolution

3. **Created `lib/appwrite/backend.ts`** - Appwrite backend client configuration

4. **Created `lib/data-fetcher.ts`** - Data fetching utilities for tickets and users

5. **Installed Dependencies** - Ran `npm install` to get all packages

6. **Removed Firebase** - Simplified to use only Appwrite database

## Next Steps

### 1. Configure Environment Variables

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

Required variables:
- Appwrite: endpoint, project ID, API key, database ID, collection IDs

### 2. Install Dependencies (if not already done)

```bash
npm install
```

### 3. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Project Structure

```
ticketer/
├── app/
│   ├── api/
│   │   └── tickets/
│   │       ├── add-member/
│   │       ├── info/
│   │       └── swap-ticket/
│   └── ticket-management/
├── lib/
│   ├── appwrite/
│   │   └── backend.ts
│   └── firebase.ts
├── .envdata-fetcher
├── package.json
├── tsconfig.json
└── next.config.js
```

## API Routes

- **POST /api/tickets/add-member** - Add member to existing ticket
- **POST /api/tickets/swap-ticket** - Swap ticket between users
- **GET /api/tickets/info** - Get ticket information
- **POST /api/attendance/mark** - Mark attendance for events

## Features

### 1. **Add Team Members**
- Add new members to existing team tickets
- QR code scanning support for auto-filling details
- Automatic capacity validation
- Prevents duplicate members
- Tracks member addition history

### 2. **Swap Tickets**
- Transfer tickets between users
- QR code scanning for quick data entry
- Complete audit trail with swap history
- Automatic record updates for both users
- Validates ownership before transfer

### 3. **Master Attendance**
- Mark attendance for any event
- QR code scanning support
- Validates ticket ownership
- Prevents duplicate attendance marking
- Tracks attendance timestamps

### 4. **QR Code Scanning**
- Built-in camera support
- Auto-fill form fields from scanned QR codes
- Works on all features (Add Member, Swap Ticket, Attendance)
- Mobile-friendly interface

## Technologies

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Appwrite** - Open-source backend server for web, mobile, and flutter developers
- **Node Appwrite SDK** - Server-side Appwrite integration

## Notes

- The system uses Appwrite as the database backend
- Cookie-based authentication for coordinators
- TypeScript strict mode configured
- All compilation errors resolved ✅
