"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, CheckCircle, Users, Ticket, X } from "lucide-react";
import QRScanner from "@/components/QRScanner";

export default function AttendancePage() {
  const router = useRouter();
  const [showScanner, setShowScanner] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    ticket_id: "",
  });

  const handleScan = (data: string) => {
    console.log("QR Code scanned:", data);
    try {
      // Try parsing as JSON first
      const parsed = JSON.parse(data);
      setFormData({
        ticket_id: parsed.ticket_id || "",
      });
      setShowScanner(false);
      if (parsed.ticket_id) {
        setError("");
        setSuccess(true);
        setTimeout(() => setSuccess(false), 2000);
      } else {
        setError("QR code is valid JSON but missing ticket_id");
      }
    } catch (err) {
      // If not JSON, try plain text format
      setShowScanner(false);
      if (data && data.length > 0) {
        // Assume it's a ticket ID if it's short enough
        if (data.length < 50 && !data.includes('http')) {
          setFormData({
            ticket_id: data,
          });
          setError("");
        } else {
          setError(`QR code format not recognized. Scanned: "${data.substring(0, 50)}..."`);
        }
      } else {
        setError("QR code is empty");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const response = await fetch("/api/attendance/mark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.ok) {
        setSuccess(true);
        setFormData({ ticket_id: "" });
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(data.error || "Failed to mark attendance");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <CheckCircle className="w-12 h-12 text-orange-500" />
            <h1 className="text-4xl font-bold text-white">Master Attendance</h1>
          </div>
          <p className="text-gray-400 text-lg">
            Scan ticket QR code or enter ticket ID to mark attendance for all team members
          </p>
        </div>

        {/* Main Form */}
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Scan Button */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowScanner(true)}
                className="inline-flex items-center gap-3 bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-xl font-semibold transition-colors shadow-lg shadow-orange-500/30"
              >
                <Camera className="w-5 h-5" />
                Scan QR Code
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-gray-800 text-gray-400">Or enter manually</span>
              </div>
            </div>

            {/* Ticket ID */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Ticket ID
              </label>
              <input
                type="text"
                value={formData.ticket_id}
                onChange={(e) => setFormData({ ticket_id: e.target.value })}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                placeholder="Enter ticket ID"
                required
              />
            </div>

            {/* Success Message */}
            {success && (
              <div className="p-4 bg-green-500/20 border border-green-500 rounded-lg flex items-center gap-3 text-green-300">
                <CheckCircle className="w-5 h-5" />
                <span>Attendance marked successfully!</span>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-500/20 border border-red-500 rounded-lg flex items-center gap-3 text-red-300">
                <X className="w-5 h-5" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white py-4 rounded-xl font-semibold transition-colors shadow-lg"
            >
              {loading ? "Marking..." : "Mark Attendance"}
            </button>
          </form>
        </div>

        {/* Info Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <Ticket className="w-5 h-5 text-orange-500" />
              <span className="font-medium text-white">Simplified Process</span>
            </div>
            <p className="text-sm text-gray-400">
              Just scan or enter the ticket ID - marks attendance for all users on the ticket
            </p>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-5 h-5 text-orange-500" />
              <span className="font-medium text-white">Validation</span>
            </div>
            <p className="text-sm text-gray-400">
              System validates ticket and prevents duplicate marking for all members
            </p>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => router.push("/ticket-management")}
            className="text-gray-400 hover:text-white font-medium transition-colors"
          >
            ← Back to Ticket Management
          </button>
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
