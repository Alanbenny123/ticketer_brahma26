import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { databases } from "@/lib/appwrite/backend";

/**
 * API Route: Add Member to Existing Ticket
 * 
 * This endpoint allows adding a new member to an existing team ticket.
 * Use cases:
 * - Team wants to add another member
 * - Converting individual ticket to team ticket
 * - Adding late registrations to existing teams
 * 
 * POST /api/tickets/add-member
 * Body: {
 *   ticket_id: string,
 *   new_user_id: string,
 *   event_id: string,
 *   max_team_size?: number
 * }
 */

interface AddMemberRequest {
  ticket_id: string;
  new_user_id: string;
  event_id: string;
  max_team_size?: number;
}

export async function POST(req: Request) {
  try {
    const body: AddMemberRequest = await req.json();
    let { ticket_id, new_user_id, event_id, max_team_size = 4 } = body;

    // Normalize ticket_id to lowercase for case-insensitive matching
    ticket_id = ticket_id?.toLowerCase();

    // Validate required fields
    if (!ticket_id || !new_user_id || !event_id) {
      return NextResponse.json(
        { ok: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check coordinator authentication
    const cookieStore = await cookies();
    const coordEventId = cookieStore.get("coord_event")?.value;
    const isMainCoordinator = cookieStore.get("main_coord")?.value === "true";

    if (!isMainCoordinator && (!coordEventId || coordEventId !== event_id)) {
      return NextResponse.json(
        { ok: false, error: "Not authorized for this event" },
        { status: 403 }
      );
    }

    // Get ticket from Appwrite
    let ticketData: any = null;

    try {
      const ticket = await databases.getDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_TICKETS!,
        ticket_id
      );
      ticketData = ticket;
    } catch (error) {
      return NextResponse.json(
        { ok: false, error: "Ticket not found" },
        { status: 404 }
      );
    }

    // Verify ticket belongs to the correct event
    if (ticketData.event_id !== event_id) {
      return NextResponse.json(
        { ok: false, error: "Ticket does not belong to specified event" },
        { status: 400 }
      );
    }

    // Check if ticket is active
    if (!ticketData.active) {
      return NextResponse.json(
        { ok: false, error: "Cannot add members to inactive ticket" },
        { status: 400 }
      );
    }

    // Get current members
    const studIds: string[] = ticketData.stud_id || [];

    // Check if user is already in the ticket
    if (studIds.includes(new_user_id)) {
      return NextResponse.json(
        { ok: false, error: "User is already a member of this ticket" },
        { status: 400 }
      );
    }

    // Optional: Check if adding this member would exceed max team size
    // Removed strict limit - teams can grow as needed
    if (studIds.length >= 10) {
      return NextResponse.json(
        { ok: false, error: `Team has reached maximum capacity of 10 members` },
        { status: 400 }
      );
    }

    // Verify the new user exists
    try {
      await databases.getDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USERS!,
        new_user_id
      );
    } catch (error) {
      return NextResponse.json(
        { ok: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Add new member to ticket
    const updatedStudIds = [...studIds, new_user_id];

    // Update the ticket
    try {
      await databases.updateDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_TICKETS!,
        ticket_id,
        {
          stud_id: updatedStudIds,
          last_modified: new Date().toISOString(),
          member_history: [
            ...(ticketData.member_history || []),
            {
              user_id: new_user_id,
              action: "added",
              timestamp: new Date().toISOString(),
            }
          ]
        }
      );

      // Update user's tickets array
      try {
        const user = await databases.getDocument(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USERS!,
          new_user_id
        );
        const userTickets = (user as any).tickets || [];
        await databases.updateDocument(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USERS!,
          new_user_id,
          {
            tickets: [...userTickets, ticket_id]
          }
        );
      } catch (userUpdateError) {
        console.error("Error updating user ticket list:", userUpdateError);
        // Continue even if user update fails - ticket update is primary concern
      }

      return NextResponse.json({
        ok: true,
        message: "Member added successfully",
        ticket_id,
        new_user_id,
        total_members: updatedStudIds.length
      });

    } catch (updateError) {
      console.error("Error updating ticket:", updateError);
      return NextResponse.json(
        { ok: false, error: "Failed to add member" },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error("Add member error:", error);
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
