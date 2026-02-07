import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { databases } from "@/lib/appwrite/backend";
import { ID, Query } from "node-appwrite";

/**
 * API Route: Mark Attendance
 * 
 * Master attendance marking endpoint for any event
 * 
 * POST /api/attendance/mark
 * Body: {
 *   ticket_id: string,
 *   timestamp?: string
 * }
 */

interface MarkAttendanceRequest {
  ticket_id: string;
  timestamp?: string;
}

export async function POST(req: Request) {
  try {
    const body: MarkAttendanceRequest = await req.json();
    let { ticket_id, timestamp } = body;

    // Normalize ticket_id to lowercase for case-insensitive matching
    ticket_id = ticket_id?.toLowerCase();

    // Validate required fields
    if (!ticket_id) {
      return NextResponse.json(
        { ok: false, error: "Missing ticket_id" },
        { status: 400 }
      );
    }

    // Get ticket to extract event_id and user list
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

    const event_id = ticketData.event_id;

    // Auth disabled for this deployment

    // Get all users from the ticket
    const studIds: string[] = ticketData.stud_id || [];
    
    if (studIds.length === 0) {
      return NextResponse.json(
        { ok: false, error: "No users found on this ticket" },
        { status: 400 }
      );
    }

    // Check existing attendance records in the attendance collection
    const existingAttendance = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ATTENDANCE || "attendance",
      [
        Query.equal("ticket_id", ticket_id),
        Query.equal("event_id", event_id)
      ]
    );

    const alreadyMarkedUsers = new Set(
      existingAttendance.documents.map((doc: any) => doc.stud_id)
    );
    
    // Mark attendance for users not yet marked
    const newlyMarked: string[] = [];
    
    for (const stud_id of studIds) {
      if (!alreadyMarkedUsers.has(stud_id)) {
        try {
          await databases.createDocument(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
            process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ATTENDANCE || "attendance",
            ID.unique(),
            {
              event_id,
              ticket_id,
              stud_id,
            }
          );
          newlyMarked.push(stud_id);
        } catch (createError) {
          console.error(`Failed to mark attendance for user ${stud_id}:`, createError);
        }
      }
    }

    if (newlyMarked.length === 0) {
      return NextResponse.json(
        { ok: false, error: "Attendance already marked for all users on this ticket" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: `Attendance marked successfully for ${newlyMarked.length} user(s)`,
      ticket_id,
      event_id,
      users_marked: newlyMarked,
      total_attended: existingAttendance.documents.length + newlyMarked.length,
      total_members: studIds.length
    });

  } catch (error) {
    console.error("Mark attendance error:", error);
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
