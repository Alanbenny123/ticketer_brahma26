"use client";

import { useRouter } from "next/navigation";
import { ArrowLeftRight, UserPlus, Users, Ticket, Lock } from "lucide-react";

export default function TicketManagementPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Ticket className="w-12 h-12 text-orange-500" />
            <h1 className="text-4xl font-bold text-white">Ticket Management</h1>
          </div>
          <p className="text-gray-400 text-lg">
            Manage event tickets, swap between users, and add members to teams
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Swap Ticket Card */}
          <div
            onClick={() => router.push("/ticket-management/swap-ticket")}
            className="group cursor-pointer bg-gradient-to-br from-orange-600/20 to-orange-800/20 border-2 border-orange-500/30 hover:border-orange-400 rounded-2xl p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/20 hover:scale-[1.02]"
          >
            <div className="flex items-start gap-6">
              <div className="p-4 bg-orange-600/30 rounded-xl group-hover:bg-orange-600/50 transition-colors">
                <ArrowLeftRight className="w-10 h-10 text-orange-300" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-3">Swap Ticket</h2>
                <p className="text-gray-300 mb-4 leading-relaxed">
                  Transfer tickets from one user to another. Maintains complete audit trail
                  and automatically updates both users' records.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-orange-300">
                    <div className="w-1.5 h-1.5 bg-orange-400 rounded-full"></div>
                    <span>Validates ownership before transfer</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-orange-300">
                    <div className="w-1.5 h-1.5 bg-orange-400 rounded-full"></div>
                    <span>Updates user ticket arrays</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-orange-300">
                    <div className="w-1.5 h-1.5 bg-orange-400 rounded-full"></div>
                    <span>Maintains swap history</span>
                  </div>
                </div>
                <div className="mt-6 flex items-center gap-2 text-orange-400 font-semibold group-hover:gap-3 transition-all">
                  <span>Start Swapping</span>
                  <span>→</span>
                </div>
              </div>
            </div>
          </div>

          {/* Add Member Card */}
          <div
            onClick={() => router.push("/ticket-management/add-member")}
            className="group cursor-pointer bg-gradient-to-br from-orange-600/20 to-orange-800/20 border-2 border-orange-500/30 hover:border-orange-400 rounded-2xl p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/20 hover:scale-[1.02]"
          >
            <div className="flex items-start gap-6">
              <div className="p-4 bg-orange-600/30 rounded-xl group-hover:bg-orange-600/50 transition-colors">
                <UserPlus className="w-10 h-10 text-orange-300" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-3">Add Member</h2>
                <p className="text-gray-300 mb-4 leading-relaxed">
                  Add new members to existing team tickets. Perfect for late registrations
                  or team expansions with capacity management.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-orange-300">
                    <div className="w-1.5 h-1.5 bg-orange-400 rounded-full"></div>
                    <span>Validates team capacity</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-orange-300">
                    <div className="w-1.5 h-1.5 bg-orange-400 rounded-full"></div>
                    <span>Prevents duplicate members</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-orange-300">
                    <div className="w-1.5 h-1.5 bg-orange-400 rounded-full"></div>
                    <span>Tracks member additions</span>
                  </div>
                </div>
                <div className="mt-6 flex items-center gap-2 text-orange-400 font-semibold group-hover:gap-3 transition-all">
                  <span>Add Members</span>
                  <span>→</span>
                </div>
              </div>
            </div>
          </div>

          {/* Attendance Card */}
          <div
            onClick={() => router.push("/ticket-management/attendance")}
            className="group cursor-pointer bg-gradient-to-br from-orange-600/20 to-orange-800/20 border-2 border-orange-500/30 hover:border-orange-400 rounded-2xl p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/20 hover:scale-[1.02]"
          >
            <div className="flex items-start gap-6">
              <div className="p-4 bg-orange-600/30 rounded-xl group-hover:bg-orange-600/50 transition-colors">
                <Ticket className="w-10 h-10 text-orange-300" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-3">Mark Attendance</h2>
                <p className="text-gray-300 mb-4 leading-relaxed">
                  Master attendance marking for any event. Scan QR codes or manually enter
                  details to mark attendance for participants.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-orange-300">
                    <div className="w-1.5 h-1.5 bg-orange-400 rounded-full"></div>
                    <span>QR code scanning support</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-orange-300">
                    <div className="w-1.5 h-1.5 bg-orange-400 rounded-full"></div>
                    <span>Validates ticket ownership</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-orange-300">
                    <div className="w-1.5 h-1.5 bg-orange-400 rounded-full"></div>
                    <span>Prevents duplicate marking</span>
                  </div>
                </div>
                <div className="mt-6 flex items-center gap-2 text-orange-400 font-semibold group-hover:gap-3 transition-all">
                  <span>Mark Attendance</span>
                  <span>→</span>
                </div>
              </div>
            </div>
          </div>
        </div>


      </div>
    </div>
  );
}
