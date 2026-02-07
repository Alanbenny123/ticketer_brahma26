import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { databases } from "@/lib/appwrite/backend";
import { Query } from "node-appwrite";

/**
 * API Route: Swap Ticket Between Two Users
 * 
 * This endpoint allows swapping a ticket from one user to another.
 * Use cases:
 * - User wants to transfer their ticket to another person
 * - Admin needs to reassign tickets
 * 
 * POST /api/tickets/swap-ticket
 * Body: {
 *   ticket_id: string,
 *   from_user_id: string,
 *   to_user_id: string,
 *   event_id: string,
 *   reason?: string
 * }
 */

interface SwapTicketRequest {
  ticket_id: string;
  from_user_id: string;
  to_user_id: string;
  event_id: string;
  reason?: string;
}

export async function POST(req: Request) {
  try {
    const body: SwapTicketRequest = await req.json();
    let { ticket_id, from_user_id, to_user_id, event_id, reason } = body;

    // Normalize IDs to lowercase for case-insensitive matching
    ticket_id = ticket_id?.toLowerCase();
    from_user_id = from_user_id?.toLowerCase();
    to_user_id = to_user_id?.toLowerCase();

    // Validate required fields
    if (!ticket_id || !from_user_id || !to_user_id || !event_id) {
      return NextResponse.json(
        { ok: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Auth disabled for this deployment

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

    // Verify ticket belongs to from_user
    const studIds = ticketData.stud_id || [];
    if (!studIds.includes(from_user_id)) {
      return NextResponse.json(
        { ok: false, error: "Ticket does not belong to the specified user" },
        { status: 400 }
      );
    }

    // Verify ticket belongs to the correct event
    if (ticketData.event_id !== event_id) {
      return NextResponse.json(
        { ok: false, error: "Ticket does not belong to specified event" },
        { status: 400 }
      );
    }

    // Replace from_user_id with to_user_id in stud_id array
    const updatedStudIds = studIds.map((id: string) => 
      id === from_user_id ? to_user_id : id
    );

    // Update the ticket
    try {
      await databases.updateDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_TICKETS!,
        ticket_id,
        {
          stud_id: updatedStudIds,
          last_modified: new Date().toISOString(),
          swap_history: [
            ...(ticketData.swap_history || []),
            {
              from_user: from_user_id,
              to_user: to_user_id,
              timestamp: new Date().toISOString(),
              reason: reason || "No reason provided",
            }
          ]
        }
      );

      // Update user ticket arrays
      // Remove ticket from from_user
      try {
        const fromUser = await databases.getDocument(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USERS!,
          from_user_id
        );
        const fromUserTickets = (fromUser as any).tickets || [];
        await databases.updateDocument(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USERS!,
          from_user_id,
          {
            tickets: fromUserTickets.filter((t: string) => t !== ticket_id)
          }
        );

        // Add ticket to to_user
        const toUser = await databases.getDocument(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USERS!,
          to_user_id
        );
        const toUserTickets = (toUser as any).tickets || [];
        await databases.updateDocument(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USERS!,
          to_user_id,
          {
            tickets: [...toUserTickets, ticket_id]
          }
        );
      } catch (userUpdateError) {
        console.error("Error updating user ticket lists:", userUpdateError);
        // Continue even if user update fails - ticket swap is primary concern
      }

      return NextResponse.json({
        ok: true,
        message: "Ticket swapped successfully",
        ticket_id,
        from_user_id,
        to_user_id
      });

    } catch (updateError) {
      console.error("Error updating ticket:", updateError);
      return NextResponse.json(
        { ok: false, error: "Failed to swap ticket" },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error("Ticket swap error:", error);
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
