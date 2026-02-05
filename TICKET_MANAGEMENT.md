# Ticket Management Extensions

This document describes the new ticket swap and member addition features added to the Brahma Coordinator App.

## New Features

### 1. 🔄 Ticket Swapping

Transfer a ticket from one user to another while maintaining event integrity and audit trails.

#### API Endpoint

**POST** `/api/tickets/swap-ticket`

**Request Body:**
```json
{
  "ticket_id": "ticket123",
  "from_user_id": "user_old",
  "to_user_id": "user_new",
  "event_id": "event123",
  "reason": "User transferred ticket" // Optional
}
```

**Response:**
```json
{
  "ok": true,
  "message": "Ticket swapped successfully",
  "ticket_id": "ticket123",
  "from_user_id": "user_old",
  "to_user_id": "user_new",
  "source": "firebase"
}
```

#### Features
- ✅ Validates ticket ownership before swapping
- ✅ Updates both user ticket arrays automatically
- ✅ Maintains swap history for audit purposes
- ✅ Supports both Firebase and Appwrite backends
- ✅ Requires coordinator authentication
- ✅ Event-specific authorization

#### UI Page

Navigate to `/coordinator/swap-ticket` to access the swap ticket interface.

**Features:**
- Simple form-based interface
- Real-time validation
- User information preview
- Success/error messaging
- Reason tracking for audit

---

### 2. ➕ Add Member to Ticket

Add new members to existing team tickets, perfect for late registrations or team expansions.

#### API Endpoint

**POST** `/api/tickets/add-member`

**Request Body:**
```json
{
  "ticket_id": "ticket123",
  "new_user_id": "newuser456",
  "event_id": "event123",
  "max_team_size": 4 // Optional, defaults to 4
}
```

**Response:**
```json
{
  "ok": true,
  "message": "Member added successfully",
  "ticket_id": "ticket123",
  "new_user_id": "newuser456",
  "total_members": 3,
  "source": "firebase"
}
```

#### Features
- ✅ Validates ticket capacity before adding
- ✅ Prevents duplicate member additions
- ✅ Updates user ticket array automatically
- ✅ Maintains member addition history
- ✅ Configurable max team size
- ✅ Only works on active tickets
- ✅ Supports both Firebase and Appwrite backends

#### UI Page

Navigate to `/coordinator/add-member` to access the add member interface.

**Features:**
- Load and view current ticket information
- See existing team members
- Real-time capacity checking
- User selection and validation
- Success/error messaging

---

### 3. 📋 Get Ticket Information

Helper endpoint to retrieve detailed ticket information including members.

#### API Endpoint

**GET** `/api/tickets/info?ticket_id=xxx&event_id=xxx`

**Response:**
```json
{
  "ok": true,
  "ticket": {
    "id": "ticket123",
    "event_id": "event123",
    "event_name": "Hackathon 2026",
    "team_name": "Code Warriors",
    "active": true,
    "members": [
      {
        "stud_id": "user1",
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+1234567890"
      }
    ],
    "max_size": 4,
    "swap_history": [],
    "member_history": []
  },
  "source": "firebase"
}
```

---

## File Structure

### API Routes
```
app/api/tickets/
├── swap-ticket/
│   └── route.ts          # Ticket swapping endpoint
├── add-member/
│   └── route.ts          # Add member endpoint
└── info/
    └── route.ts          # Get ticket info endpoint
```

### UI Pages
```
app/ticket-management/
├── page.tsx              # Main navigation dashboard
├── swap-ticket/
│   └── page.tsx          # Swap ticket interface
└── add-member/
    └── page.tsx          # Add member interface
```

### Types & Schemas
```
lib/
├── types.ts              # Updated with new types
└── validations/
    └── schemas.ts        # Updated with new schemas
```

---

## Usage Examples

### Swapping a Ticket

```typescript
const response = await fetch("/api/tickets/swap-ticket", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    ticket_id: "T123",
    from_user_id: "U001",
    to_user_id: "U002",
    event_id: "E001",
    reason: "User transferred ticket to team member"
  })
});

const data = await response.json();
if (data.ok) {
  console.log("Ticket swapped successfully!");
}
```

### Adding a Member

```typescript
const response = await fetch("/api/tickets/add-member", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    ticket_id: "T123",
    new_user_id: "U003",
    event_id: "E001",
    max_team_size: 4
  })
});

const data = await response.json();
if (data.ok) {
  console.log(`Total members now: ${data.total_members}`);
}
```

---

## Data Models

### Ticket Document (Updated)

```typescript
{
  $id: string;
  event_id: string;
  event_name: string;
  stud_id: string[];           // Array of user IDs
  team_name?: string;
  active: boolean;
  last_modified: string;
  
  // New fields
  swap_history?: Array<{
    from_user: string;
    to_user: string;
    timestamp: string;
    reason: string;
  }>;
  
  member_history?: Array<{
    user_id: string;
    action: "added" | "removed";
    timestamp: string;
  }>;
}
```

---

## Security & Authorization

Both endpoints require:
1. **Coordinator Authentication**: Valid coordinator session cookie
2. **Event Authorization**: Coordinator must be assigned to the event OR be a main coordinator
3. **Input Validation**: All inputs validated using Zod schemas

---

## Error Handling

### Common Error Responses

**400 Bad Request**
```json
{
  "ok": false,
  "error": "Missing required fields"
}
```

**403 Forbidden**
```json
{
  "ok": false,
  "error": "Not authorized for this event"
}
```

**404 Not Found**
```json
{
  "ok": false,
  "error": "Ticket not found"
}
```

**500 Internal Server Error**
```json
{
  "ok": false,
  "error": "Internal server error"
}
```

---

## Backend Compatibility

✅ **Firebase** - Primary backend with full support
✅ **Appwrite** - Fallback backend with full support

Both endpoints automatically detect and use the available backend, with Firebase taking priority.

---

## Navigation

Add links to these pages in your coordinator dashboard or navigation:

```tsx
// Example navigation buttons
<Link href="/ticket-management">
  <Button>Ticket Management</Button>
</Link>

// Or direct links
<Link href="/ticket-management/swap-ticket">
  <Button>Swap Ticket</Button>
</Link>

<Link href="/ticket-management/add-member">
  <Button>Add Member</Button>
</Link>
```

---ticket-management/swap-ticket`
2. Enter valid ticket ID and event ID
3. Enter from_user_id (must be in ticket)
4. Enter to_user_id (must exist in system)
5. Optionally add a reason
6. Click "Swap Ticket"

### Test Add Member
1. Navigate to `/ticket-managementist in system)
5. Optionally add a reason
6. Click "Swap Ticket"

### Test Add Member
1. Navigate to `/coordinator/add-member`
2. Enter ticket ID and event ID
3. Click "Load Ticket Info" to see current members
4. Enter new user ID
5. Verify max team size setting
6. Click "Add Member to Ticket"

---

## Future Enhancements

Potential improvements for future versions:

- [ ] User search functionality (autocomplete)
- [ ] Bulk member additions
- [ ] Remove member functionality
- [ ] Ticket transfer notifications via email
- [ ] Admin approval for ticket swaps
- [ ] Ticket swap requests from users
- [ ] Team leader designation
- [ ] Merge tickets functionality

---

## Support

For issues or questions:
1. Check API error messages for specific details
2. Verify coordinator authentication is active
3. Ensure user IDs and ticket IDs are valid
4. Check event authorization permissions

---

**Last Updated:** February 5, 2026
**Version:** 1.0.0
