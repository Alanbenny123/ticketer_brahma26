# Ticket Management System

A standalone module for managing event tickets, including swapping tickets between users and adding members to existing team tickets.

## 📍 Location

This is a separate section from the coordinator dashboard:
- **Main Page**: `/ticket-management`
- **Swap Ticket**: `/ticket-management/swap-ticket`  
- **Add Member**: `/ticket-management/add-member`

## 🚀 Quick Access

Navigate to `/ticket-management` to see the main dashboard with options for both features.

## 📁 Folder Structure

```
ticket-management/
├── page.tsx                    # Main navigation dashboard
├── swap-ticket/
│   └── page.tsx               # Swap ticket interface
└── add-member/
    └── page.tsx               # Add member interface
```

## 🔗 API Endpoints

APIs are located separately:

```
app/api/tickets/
├── swap-ticket/
│   └── route.ts              # POST /api/tickets/swap-ticket
├── add-member/
│   └── route.ts              # POST /api/tickets/add-member
└── info/
    └── route.ts              # GET /api/tickets/info
```

## ✨ Features

### 🔄 Swap Ticket
Transfer tickets from one user to another with full audit trail:
- Validates ticket ownership
- Updates both users automatically  
- Maintains swap history
- Requires coordinator authentication

### ➕ Add Member
Add new members to existing team tickets:
- Validates team capacity
- Prevents duplicate additions
- Configurable max team size
- Tracks member history

## 🔐 Security

Both features require:
- ✅ Valid coordinator session
- ✅ Event-specific authorization
- ✅ Input validation (Zod schemas)
- ✅ Audit trail logging

## 💻 Tech Stack

- **Framework**: Next.js 16
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **Backend**: Firebase + Appwrite
- **Validation**: Zod

## 📖 Documentation

See the following files for detailed information:
- `TICKET_MANAGEMENT.md` - Complete API documentation
- `TICKET_MANAGEMENT_SUMMARY.md` - Quick reference guide

## 🎯 Usage

### Access the Dashboard

```
1. Navigate to /ticket-management
2. Choose either "Swap Ticket" or "Add Member"  
3. Fill in the required information
4. Submit the form
```

### Swap a Ticket

```typescript
POST /api/tickets/swap-ticket
{
  "ticket_id": "T123",
  "from_user_id": "user1",
  "to_user_id": "user2", 
  "event_id": "E001",
  "reason": "Optional reason"
}
```

### Add a Member

```typescript
POST /api/tickets/add-member
{
  "ticket_id": "T123",
  "new_user_id": "user3",
  "event_id": "E001",
  "max_team_size": 4
}
```

## 🛠️ Integration

This module is standalone but integrates with:
- Coordinator authentication system
- Firebase/Appwrite databases
- Existing ticket validation
- User management system

## 🔗 Navigation

Add a link to this module from your coordinator dashboard:

```tsx
<Link href="/ticket-management">
  Ticket Management
</Link>
```

---

**Version**: 1.0.0  
**Last Updated**: February 5, 2026
