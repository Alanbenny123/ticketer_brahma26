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
    const { ticket_id, timestamp } = body;

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

    // Get all users from the ticket
    const studIds: string[] = ticketData.stud_id || [];
    
    if (studIds.length === 0) {
      return NextResponse.json(
        { ok: false, error: "No users found on this ticket" },
        { status: 400 }
      );
    }

    // Get existing attendance records
    const attendanceRecords = ticketData.attendance || [];
    
    // Mark attendance for all users on the ticket
    const attendanceTimestamp = timestamp || new Date().toISOString();
    const markedBy = coordEventId || "main_coordinator";
    const newAttendanceRecords: any[] = [];
    
    for (const user_id of studIds) {
      // Check if this user's attendance is already marked
      const alreadyMarked = attendanceRecords.some(
        (record: any) => record.user_id === user_id
      );
      
      if (!alreadyMarked) {
        newAttendanceRecords.push({
          user_id,
          timestamp: attendanceTimestamp,
          marked_by: markedBy,
        });
      }
    }

    if (newAttendanceRecords.length === 0) {
      return NextResponse.json(
        { ok: false, error: "Attendance already marked for all users on this ticket" },
        { status: 400 }
      );
    }

    const updatedAttendance = [...attendanceRecords, ...newAttendanceRecords];

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
      message: `Attendance marked successfully for ${newAttendanceRecords.length} user(s)`,
      ticket_id,
      users_marked: newAttendanceRecords.map(r => r.user_id),
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
