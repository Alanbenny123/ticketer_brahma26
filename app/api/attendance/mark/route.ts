import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { databases } from "@/lib/appwrite/backend";

/**
 * API Route: Mark Attendance
 * 
 * Master attendance marking endpoint for any event
 * 
 * POST /api/attendance/mark
 * Body: {
 *   ticket_id: string,
 *   event_id: string,
 *   user_id: string,
 *   timestamp?: string
 * }
 */

interface MarkAttendanceRequest {
  ticket_id: string;
  event_id: string;
  user_id: string;
  timestamp?: string;
}

export async function POST(req: Request) {
  try {
    const body: MarkAttendanceRequest = await req.json();
    const { ticket_id, event_id, user_id, timestamp } = body;

    // Validate required fields
    if (!ticket_id || !event_id || !user_id) {
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

    // Verify ticket exists and belongs to event
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

    if (ticketData.event_id !== event_id) {
      return NextResponse.json(
        { ok: false, error: "Ticket does not belong to this event" },
        { status: 400 }
      );
    }

    // Verify user is part of the ticket
    const studIds: string[] = ticketData.stud_id || [];
    if (!studIds.includes(user_id)) {
      return NextResponse.json(
        { ok: false, error: "User is not a member of this ticket" },
        { status: 400 }
      );
    }

    // Check if already marked
    const attendanceRecords = ticketData.attendance || [];
    const alreadyMarked = attendanceRecords.some(
      (record: any) => record.user_id === user_id
    );

    if (alreadyMarked) {
      return NextResponse.json(
        { ok: false, error: "Attendance already marked for this user" },
        { status: 400 }
      );
    }

    // Mark attendance
    const attendanceTimestamp = timestamp || new Date().toISOString();
    const updatedAttendance = [
      ...attendanceRecords,
      {
        user_id,
        timestamp: attendanceTimestamp,
        marked_by: coordEventId || "main_coordinator",
      }
    ];

    await databases.updateDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_TICKETS!,
      ticket_id,
      {
        attendance: updatedAttendance,
        last_modified: new Date().toISOString(),
      }
    );

    return NextResponse.json({
      ok: true,
      message: "Attendance marked successfully",
      ticket_id,
      user_id,
      timestamp: attendanceTimestamp,
      total_attended: updatedAttendance.length,
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
