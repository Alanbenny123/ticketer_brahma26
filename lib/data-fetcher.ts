import { databases } from "@/lib/appwrite/backend";

/**
 * Data fetching utilities for tickets and users using Appwrite
 */

interface FetchResult<T> {
  data?: T;
  success: boolean;
  source: string;
  error?: string;
}

/**
 * Fetch a single ticket by ID from Appwrite
 */
export async function fetchTicket(ticketId: string): Promise<{ ticket: any; success: boolean; source: string }> {
  try {
    const ticket = await databases.getDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_TICKETS!,
      ticketId
    );
    
    return {
      ticket,
      success: true,
      source: "appwrite"
    };
  } catch (error) {
    console.error("Error fetching ticket:", error);
    return {
      ticket: null,
      success: false,
      source: "appwrite"
    };
  }
}

/**
 * Fetch multiple users by IDs from Appwrite
 */
export async function fetchUsers(userIds: string[]): Promise<{ users: any[]; success: boolean; source: string }> {
  if (!userIds || userIds.length === 0) {
    return {
      users: [],
      success: true,
      source: "appwrite"
    };
  }

  const users: any[] = [];
  
  try {
    // Fetch each user individually
    for (const userId of userIds) {
      try {
        const user = await databases.getDocument(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USERS!,
          userId
        );
        users.push(user);
      } catch (error) {
        console.error(`Error fetching user ${userId}:`, error);
        // Continue with other users even if one fails
      }
    }

    return {
      users,
      success: true,
      source: "appwrite"
    };
  } catch (error) {
    console.error("Error fetching users:", error);
    return {
      users,
      success: false,
      source: "appwrite"
    };
  }
}

/**
 * Fetch all tickets for an event from Appwrite
 */
export async function fetchEventTickets(eventId: string): Promise<FetchResult<any[]>> {
  try {
    const { Query } = await import("node-appwrite");
    
    const response = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_TICKETS!,
      [Query.equal("event_id", eventId)]
    );

    return {
      data: response.documents,
      success: true,
      source: "appwrite"
    };
  } catch (error) {
    console.error("Error fetching event tickets:", error);
    return {
      success: false,
      source: "appwrite",
      error: "Failed to fetch event tickets"
    };
  }
}

/**
 * Fetch a user by ID from Appwrite
 */
export async function fetchUser(userId: string): Promise<{ user: any; success: boolean; source: string }> {
  try {
    const user = await databases.getDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USERS!,
      userId
    );
    
    return {
      user,
      success: true,
      source: "appwrite"
    };
  } catch (error) {
    console.error("Error fetching user:", error);
    return {
      user: null,
      success: false,
      source: "appwrite"
    };
  }
}
