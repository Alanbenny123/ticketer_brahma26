import { NextResponse } from "next/server";
import { databases } from "@/lib/appwrite/backend";

/**
 * API Route: Get Basic Ticket Information
 * 
 * Returns basic ticket info (event_id mainly) without authentication
 * Used for auto-loading event_id when only ticket_id is provided
 * 
 * GET /api/tickets/get-basic?ticket_id=xxx
 */

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const ticket_id = searchParams.get("ticket_id");

    if (!ticket_id) {
      return NextResponse.json(
        { ok: false, error: "Missing ticket_id" },
        { status: 400 }
      );
    }

    // Fetch ticket
    try {
      const ticket = await databases.getDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_TICKETS!,
        ticket_id
      );

      return NextResponse.json({
        ok: true,
        ticket: {
          id: (ticket as any).$id,
          event_id: (ticket as any).event_id,
          active: (ticket as any).active,
        },
      });
    } catch (error) {
      return NextResponse.json(
        { ok: false, error: "Ticket not found" },
        { status: 404 }
      );
    }

  } catch (error) {
    console.error("Get basic ticket info error:", error);
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
