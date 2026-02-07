import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { fetchTicket, fetchUsers } from "@/lib/data-fetcher";
import { databases } from "@/lib/appwrite/backend";

/**
 * API Route: Get Ticket Information
 * 
 * Returns detailed information about a ticket including members
 * 
 * GET /api/tickets/info?ticket_id=xxx&event_id=xxx
 */

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    let ticket_id = searchParams.get("ticket_id");
    const event_id = searchParams.get("event_id");

    // Normalize ticket_id to lowercase for case-insensitive matching
    ticket_id = ticket_id?.toLowerCase();

    if (!ticket_id || !event_id) {
      return NextResponse.json(
        { ok: false, error: "Missing ticket_id or event_id" },
        { status: 400 }
      );
    }

    // Auth disabled for this deployment

    // Fetch ticket
    const { ticket, success, source } = await fetchTicket(ticket_id);

    if (!success || !ticket) {
      return NextResponse.json(
        { ok: false, error: "Ticket not found" },
        { status: 404 }
      );
    }

    const ticketData = ticket as any;

    if (ticketData.event_id !== event_id) {
      return NextResponse.json(
        { ok: false, error: "Ticket does not belong to this event" },
        { status: 403 }
      );
    }

    // Fetch event information from events collection
    let eventName = "Unknown Event";
    try {
      const eventDoc = await databases.getDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_EVENTS || "events",
        event_id  // event_id is the $id of the event document
      );
      eventName = (eventDoc as any).event_name || "Unknown Event";
    } catch (eventError) {
      console.log("Could not fetch event details:", eventError);
      eventName = ticketData.event_name || "Unknown Event";
    }

    // Get student IDs from ticket
    const studIds: string[] = ticketData.stud_id || [];

    // Fetch user information
    const { users } = await fetchUsers(studIds);

    const userMap = new Map<string, any>();
    for (const user of users) {
      userMap.set(user.$id, user);
    }

    // Build member list with details
    const members = studIds.map((stud_id: string) => {
      const user = userMap.get(stud_id);
      return {
        stud_id,
        name: user ? (user as any).name : stud_id,
        email: user ? (user as any).email : undefined,
        phone: user ? (user as any).phone : undefined,
      };
    });

    return NextResponse.json({
      ok: true,
      ticket: {
        id: ticketData.$id,
        event_id: ticketData.event_id,
        event_name: eventName,
        team_name: ticketData.team_name,
        active: ticketData.active,
        members,
        max_size: 4, // Default, can be made dynamic
        swap_history: ticketData.swap_history || [],
        member_history: ticketData.member_history || [],
      },
      source,
    });

  } catch (error) {
    console.error("Get ticket info error:", error);
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
