"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, UserPlus, AlertCircle, CheckCircle2, Users, Search, Camera } from "lucide-react";
import QRScanner from "@/components/QRScanner";

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

interface Member {
  stud_id: string;
  name: string;
}

interface Ticket {
  id: string;
  event_id: string;
  event_name: string;
  team_name?: string;
  members: Member[];
  max_size: number;
}

export default function AddMemberPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [showScanner, setShowScanner] = useState(false);

  // Form state
  const [ticketId, setTicketId] = useState("");
  const [eventId, setEventId] = useState("");
  const [newUserIds, setNewUserIds] = useState<string[]>([""]);  // Array for multiple users

  // Ticket info state
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loadingTicket, setLoadingTicket] = useState(false);

  // New user state - keeping for compatibility but using array
  const [newUser, setNewUser] = useState<User | null>(null);
  const [searchUser, setSearchUser] = useState("");
  const [userResults, setUserResults] = useState<User[]>([]);
  const [searchingUser, setSearchingUser] = useState(false);

  useEffect(() => {
    // Auto-dismiss messages after 5 seconds
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleScan = (data: string) => {
    console.log("QR Code scanned:", data);
    try {
      // Try parsing as JSON first
      const parsed = JSON.parse(data);
      let ticketIdFromQR = parsed.ticket_id;
      let eventIdFromQR = parsed.event_id;
      
      setShowScanner(false);
      
      if (ticketIdFromQR) {
        const normalizedTicketId = ticketIdFromQR.toLowerCase();
        setTicketId(normalizedTicketId);
        
        if (eventIdFromQR) {
          // We have both ticket_id and event_id
          setEventId(eventIdFromQR);
          setMessage({ type: "success", text: `QR code scanned! Loading ticket info...` });
          loadTicketInfoWithIds(ticketIdFromQR, eventIdFromQR);
        } else {
          // Only have ticket_id, need to fetch ticket to get event_id
          setMessage({ type: "success", text: `Ticket ID scanned! Loading details...` });
          fetchTicketAndLoad(ticketIdFromQR);
        }
      } else {
        setMessage({ type: "error", text: "QR code is valid JSON but missing ticket_id" });
      }
    } catch (err) {
      // If not JSON, try plain text format (assume it's a ticket ID)
      setShowScanner(false);
      if (data && data.length > 0) {
        if (data.length < 50 && !data.includes('http')) {
          setTicketId(data.toLowerCase());
          setMessage({ type: "success", text: "Ticket ID scanned! Loading details..." });
          fetchTicketAndLoad(data.toLowerCase());
          setMessage({ type: "success", text: "QR code scanned as Ticket ID. Please enter Event ID and load ticket info." });
        } else {
          setMessage({ type: "error", text: `QR code format not recognized. Scanned: "${data.substring(0, 50)}..."` });
        }
      } else {
        setMessage({ type: "error", text: "QR code is empty" });
      }
    }
  };

  const fetchTicketAndLoad = async (tId: string) => {
    setLoadingTicket(true);
    try {
      // First, get the ticket to extract event_id
      const response = await fetch(`/api/tickets/get-basic?ticket_id=${tId}`);
      if (response.ok) {
        const data = await response.json();
        const eId = data.ticket.event_id;
        setEventId(eId);
        // Now load full ticket info
        loadTicketInfoWithIds(tId, eId);
      } else {
        setLoadingTicket(false);
        setMessage({ type: "error", text: "Failed to fetch ticket details" });
      }
    } catch (error) {
      console.error("Fetch ticket error:", error);
      setLoadingTicket(false);
      setMessage({ type: "error", text: "Error fetching ticket" });
    }
  };

  const loadTicketInfoWithIds = async (tId: string, eId: string) => {
    setLoadingTicket(true);
    try {
      const response = await fetch(`/api/tickets/info?ticket_id=${tId}&event_id=${eId}`);
      if (response.ok) {
        const data = await response.json();
        setTicket(data.ticket);
        setMessage({ type: "success", text: `Ticket loaded! Event: ${data.ticket.event_name}` });
      } else {
        setMessage({ type: "error", text: "Failed to load ticket information" });
      }
    } catch (error) {
      console.error("Load ticket error:", error);
      setMessage({ type: "error", text: "Error loading ticket information" });
    } finally {
      setLoadingTicket(false);
    }
  };

  const loadTicketInfo = async () => {
    if (!ticketId || !eventId) return;

    setLoadingTicket(true);
    try {
      const response = await fetch(`/api/tickets/info?ticket_id=${ticketId}&event_id=${eventId}`);
      if (response.ok) {
        const data = await response.json();
        setTicket(data.ticket);
        setMessage({ type: "success", text: `Ticket loaded! Event: ${data.ticket.event_name}` });
      } else {
        setMessage({ type: "error", text: "Failed to load ticket information" });
      }
    } catch (error) {
      console.error("Load ticket error:", error);
      setMessage({ type: "error", text: "Error loading ticket information" });
    } finally {
      setLoadingTicket(false);
    }
  };

  const searchUsers = async (query: string) => {
    if (query.length < 2) return;

    setSearchingUser(true);
    try {
      // This would call your user search API
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        setUserResults(data.users || []);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setSearchingUser(false);
    }
  };

  const selectUser = (user: User) => {
    setNewUser(user);
    setNewUserIds([user.id]);  // Using array for multiple users
    setSearchUser(user.name);
    setUserResults([]);
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();

    // Filter out empty user IDs
    const validUserIds = newUserIds.filter(id => id.trim() !== "");

    if (!ticketId || !eventId || validUserIds.length === 0) {
      setMessage({ type: "error", text: "Please fill in ticket info and at least one user ID" });
      return;
    }

    setAdding(true);
    setMessage(null);

    try {
      let successCount = 0;
      let failCount = 0;
      const errors: string[] = [];

      // Add each user one by one
      for (const userId of validUserIds) {
        try {
          const response = await fetch("/api/tickets/add-member", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ticket_id: ticketId,
              new_user_id: userId,
              event_id: eventId,
            }),
          });

          const data = await response.json();

          if (data.ok) {
            successCount++;
          } else {
            failCount++;
            errors.push(`${userId}: ${data.error}`);
          }
        } catch (error) {
          failCount++;
          errors.push(`${userId}: Network error`);
        }
      }

      // Show results
      if (successCount > 0 && failCount === 0) {
        setMessage({ 
          type: "success", 
          text: `Successfully added ${successCount} member(s) to ticket!` 
        });
        
        // Reset form after 2 seconds
        setTimeout(() => {
          setNewUserIds([""]);  // Reset to single empty input
          setNewUser(null);
          setSearchUser("");
          if (ticketId && eventId) {
            loadTicketInfoWithIds(ticketId, eventId); // Reload ticket info
          }
        }, 2000);
      } else if (successCount > 0 && failCount > 0) {
        setMessage({ 
          type: "error", 
          text: `Added ${successCount} member(s), but ${failCount} failed: ${errors.join(", ")}` 
        });
        if (ticketId && eventId) {
          loadTicketInfoWithIds(ticketId, eventId);
        }
      } else {
        setMessage({ type: "error", text: `Failed to add members: ${errors.join(", ")}` });
      }
    } catch (error) {
      console.error("Add member error:", error);
      setMessage({ type: "error", text: "An error occurred while adding members" });
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="text-orange-500 hover:text-orange-400 font-medium mb-4 flex items-center gap-2"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <UserPlus className="w-8 h-8 text-orange-500" />
            Add Member to Ticket
          </h1>
          <p className="text-gray-400 mt-2">
            Add a new member to an existing team ticket. The ticket must have space available.
          </p>
        </div>

        {/* Message Display */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
              message.type === "error"
                ? "bg-red-900/30 border border-red-700 text-red-300"
                : "bg-green-900/30 border border-green-700 text-green-300"
            }`}
          >
            {message.type === "error" ? (
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" />
            )}
            <p className="flex-1">{message.text}</p>
            <button
              onClick={() => setMessage(null)}
              className="text-gray-400 hover:text-gray-200"
            >
              ×
            </button>
          </div>
        )}

        {/* Add Member Form */}
        <div className="bg-gray-800 rounded-xl shadow-lg p-6 md:p-8 border border-gray-700">
          <form onSubmit={handleAddMember} className="space-y-6">
            {/* Scan QR Button */}
            <button
              type="button"
              onClick={() => setShowScanner(true)}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Camera className="w-5 h-5" />
              Scan QR Code to Fill Details
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-gray-800 text-gray-400">Or enter manually</span>
              </div>
            </div>

            {/* Ticket and Event Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Ticket ID *
                </label>
                <input
                  type="text"
                  value={ticketId}
                  onChange={(e) => setTicketId(e.target.value.toLowerCase())}
                  placeholder="Enter ticket ID"
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white placeholder-gray-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Event ID *
                </label>
                <input
                  type="text"
                  value={eventId}
                  onChange={(e) => setEventId(e.target.value)}
                  placeholder="Enter event ID"
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white placeholder-gray-500"
                  required
                />
              </div>
            </div>

            {/* Load Ticket Button */}
            <button
              type="button"
              onClick={loadTicketInfo}
              disabled={!ticketId || !eventId || loadingTicket}
              className="w-full bg-gray-700 hover:bg-gray-600 disabled:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {loadingTicket ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Load Ticket Info
                </>
              )}
            </button>

            {/* Current Ticket Info */}
            {ticket && (
              <div className="p-4 bg-orange-900/30 border border-orange-700 rounded-lg">
                <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <Users className="w-5 h-5 text-orange-500" />
                  Current Ticket Information
                </h3>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-300">
                    <span className="font-medium">Event ID:</span> {ticket.event_id}
                  </p>
                  <p className="text-gray-300">
                    <span className="font-medium">Event Name:</span> {ticket.event_name}
                  </p>
                  {ticket.team_name && (
                    <p className="text-gray-300">
                      <span className="font-medium">Team:</span> {ticket.team_name}
                    </p>
                  )}
                  <p className="text-gray-300">
                    <span className="font-medium">Current Members:</span> {ticket.members.length}
                  </p>
                  <div className="mt-3">
                    <p className="font-medium mb-2 text-gray-300">Members:</p>
                    <ul className="space-y-1 pl-4">
                      {ticket.members.map((member) => (
                        <li key={member.stud_id} className="text-gray-400">
                          • {member.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* New Users to Add */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                User IDs to Add *
              </label>
              <div className="space-y-3">
                {newUserIds.map((userId, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={userId}
                      onChange={(e) => {
                        const updated = [...newUserIds];
                        updated[index] = e.target.value;
                        setNewUserIds(updated);
                      }}
                      placeholder={`Enter user ID ${index + 1}`}
                      className="flex-1 px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white placeholder-gray-500"
                      required={index === 0}
                    />
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          const updated = newUserIds.filter((_, i) => i !== index);
                          setNewUserIds(updated);
                        }}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setNewUserIds([...newUserIds, ""])}
                  className="w-full py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium"
                >
                  + Add Another User
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={adding || !ticket || !ticketId || !eventId}
              className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {adding ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Adding Member(s)...
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  Add Member(s) to Ticket
                </>
              )}
            </button>
          </form>
        </div>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-orange-900/30 border border-orange-700 rounded-lg">
          <h3 className="font-semibold text-orange-400 mb-2">ℹ️ Important Notes:</h3>
          <ul className="text-sm text-gray-300 space-y-1 list-disc list-inside">
            <li>The user must exist in the system and not already be in the ticket</li>
            <li>The ticket must have available space (not at max capacity)</li>
            <li>The ticket must be active</li>
            <li>The ticket must belong to the specified event</li>
            <li>Load ticket info first to see current members and available space</li>
          </ul>
        </div>
      </div>

      {/* QR Scanner Modal */}
      {showScanner && (
        <QRScanner
          onScan={handleScan}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
}
