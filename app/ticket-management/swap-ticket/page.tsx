"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, ArrowLeftRight, AlertCircle, CheckCircle2, Search, Users, Camera } from "lucide-react";
import QRScanner from "@/components/QRScanner";

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

interface Ticket {
  id: string;
  event_name: string;
  team_name?: string;
  members: User[];
}

export default function SwapTicketPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [swapping, setSwapping] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [showScanner, setShowScanner] = useState(false);

  // Form state
  const [ticketId, setTicketId] = useState("");
  const [eventId, setEventId] = useState("");
  const [fromUserId, setFromUserId] = useState("");
  const [toUserId, setToUserId] = useState("");
  const [reason, setReason] = useState("");

  // Search state
  const [searchFromUser, setSearchFromUser] = useState("");
  const [searchToUser, setSearchToUser] = useState("");
  const [fromUserResults, setFromUserResults] = useState<User[]>([]);
  const [toUserResults, setToUserResults] = useState<User[]>([]);
  const [searchingFromUser, setSearchingFromUser] = useState(false);
  const [searchingToUser, setSearchingToUser] = useState(false);

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [fromUser, setFromUser] = useState<User | null>(null);
  const [toUser, setToUser] = useState<User | null>(null);

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
      let fieldsSet = 0;
      if (parsed.ticket_id) { setTicketId(parsed.ticket_id); fieldsSet++; }
      if (parsed.event_id) { setEventId(parsed.event_id); fieldsSet++; }
      if (parsed.user_id) { setFromUserId(parsed.user_id); fieldsSet++; }
      
      setShowScanner(false);
      if (fieldsSet > 0) {
        setMessage({ type: "success", text: `QR code scanned! ${fieldsSet} field(s) filled.` });
      } else {
        setMessage({ type: "error", text: "QR code is valid JSON but missing required fields (ticket_id, event_id, user_id)" });
      }
    } catch (err) {
      // If not JSON, try plain text format
      setShowScanner(false);
      if (data && data.length > 0) {
        // Assume it's a ticket ID if it's short enough
        if (data.length < 50 && !data.includes('http')) {
          setTicketId(data);
          setMessage({ type: "success", text: "QR code scanned as Ticket ID" });
        } else {
          setMessage({ type: "error", text: `QR code format not recognized. Scanned: "${data.substring(0, 50)}..."` });
        }
      } else {
        setMessage({ type: "error", text: "QR code is empty" });
      }
    }
  };

  const searchUsers = async (query: string, type: "from" | "to") => {
    if (query.length < 2) return;

    const setSearching = type === "from" ? setSearchingFromUser : setSearchingToUser;
    const setResults = type === "from" ? setFromUserResults : setToUserResults;

    setSearching(true);
    try {
      // This would call your user search API
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        setResults(data.users || []);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setSearching(false);
    }
  };

  const selectFromUser = (user: User) => {
    setFromUser(user);
    setFromUserId(user.id);
    setSearchFromUser(user.name);
    setFromUserResults([]);
  };

  const selectToUser = (user: User) => {
    setToUser(user);
    setToUserId(user.id);
    setSearchToUser(user.name);
    setToUserResults([]);
  };

  const handleSwapTicket = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!ticketId || !fromUserId || !toUserId || !eventId) {
      setMessage({ type: "error", text: "Please fill in all required fields" });
      return;
    }

    if (fromUserId === toUserId) {
      setMessage({ type: "error", text: "Cannot swap ticket to the same user" });
      return;
    }

    setSwapping(true);
    setMessage(null);

    try {
      const response = await fetch("/api/tickets/swap-ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticket_id: ticketId,
          from_user_id: fromUserId,
          to_user_id: toUserId,
          event_id: eventId,
          reason,
        }),
      });

      const data = await response.json();

      if (data.ok) {
        setMessage({ 
          type: "success", 
          text: `Ticket ${ticketId} successfully swapped from ${fromUser?.name} to ${toUser?.name}` 
        });
        
        // Reset form after 2 seconds
        setTimeout(() => {
          setTicketId("");
          setEventId("");
          setFromUserId("");
          setToUserId("");
          setReason("");
          setFromUser(null);
          setToUser(null);
          setSearchFromUser("");
          setSearchToUser("");
        }, 2000);
      } else {
        setMessage({ type: "error", text: data.error || "Failed to swap ticket" });
      }
    } catch (error) {
      console.error("Swap error:", error);
      setMessage({ type: "error", text: "An error occurred while swapping the ticket" });
    } finally {
      setSwapping(false);
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
            <ArrowLeftRight className="w-8 h-8 text-orange-500" />
            Swap Ticket Between Users
          </h1>
          <p className="text-gray-400 mt-2">
            Transfer a ticket from one user to another. Both users must exist in the system.
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

        {/* Swap Form */}
        <div className="bg-gray-800 rounded-xl shadow-lg p-6 md:p-8 border border-gray-700">
          <form onSubmit={handleSwapTicket} className="space-y-6">
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

            {/* Ticket ID */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Ticket ID *
              </label>
              <input
                type="text"
                value={ticketId}
                onChange={(e) => setTicketId(e.target.value)}
                placeholder="Enter ticket ID"
                className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white placeholder-gray-500"
                required
              />
            </div>

            {/* Event ID */}
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

            {/* From User */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                From User (Current Ticket Holder) *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={fromUserId}
                  onChange={(e) => setFromUserId(e.target.value)}
                  placeholder="Enter user ID"
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white placeholder-gray-500"
                  required
                />
              </div>
              {fromUser && (
                <div className="mt-2 p-3 bg-orange-900/30 border border-orange-700 rounded-lg">
                  <p className="text-sm font-medium text-white">{fromUser.name}</p>
                  <p className="text-sm text-gray-400">{fromUser.email}</p>
                </div>
              )}
            </div>

            {/* To User */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                To User (New Ticket Holder) *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={toUserId}
                  onChange={(e) => setToUserId(e.target.value)}
                  placeholder="Enter user ID"
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white placeholder-gray-500"
                  required
                />
              </div>
              {toUser && (
                <div className="mt-2 p-3 bg-orange-900/30 border border-orange-700 rounded-lg">
                  <p className="text-sm font-medium text-white">{toUser.name}</p>
                  <p className="text-sm text-gray-400">{toUser.email}</p>
                </div>
              )}
            </div>



            {/* Submit Button */}
            <button
              type="submit"
              disabled={swapping}
              className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {swapping ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Swapping Ticket...
                </>
              ) : (
                <>
                  <ArrowLeftRight className="w-5 h-5" />
                  Swap Ticket
                </>
              )}
            </button>
          </form>
        </div>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-orange-900/30 border border-orange-700 rounded-lg">
          <h3 className="font-semibold text-orange-400 mb-2">ℹ️ Important Notes:</h3>
          <ul className="text-sm text-gray-300 space-y-1 list-disc list-inside">
            <li>The ticket must belong to the "From User" being specified</li>
            <li>Both users must exist in the system</li>
            <li>The ticket must belong to the specified event</li>
            <li>This action will update the ticket ownership immediately</li>
            <li>A history record will be maintained for audit purposes</li>
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
