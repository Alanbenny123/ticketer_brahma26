import Link from 'next/link';
import { Ticket, Database, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-4 mb-6">
            <Ticket className="w-16 h-16 text-orange-500" />
            <h1 className="text-6xl font-bold text-white">Ticketer</h1>
          </div>
          <p className="text-2xl text-gray-400 mb-4">Event Ticket Management System</p>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Streamline your event ticketing with powerful tools for managing tickets,
            adding team members, and transferring tickets between users.
          </p>
        </div>
        
        {/* Main CTA */}
        <div className="bg-gradient-to-br from-orange-600/20 to-orange-800/20 border-2 border-orange-500/30 rounded-2xl p-8 mb-8 hover:border-orange-400 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-white mb-3">Ticket Management Portal</h2>
              <p className="text-gray-300 mb-6">
                Access the full-featured ticket management dashboard to handle all your
                event ticketing needs in one place.
              </p>
              <Link 
                href="/ticket-management" 
                className="inline-flex items-center gap-3 bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-xl font-semibold transition-colors shadow-lg shadow-orange-500/30"
              >
                <span>Open Dashboard</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <div className="w-12 h-12 bg-orange-600/30 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">👥</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Add Team Members</h3>
            <p className="text-gray-400">
              Easily add new members to existing tickets with automatic capacity validation
              and duplicate prevention.
            </p>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <div className="w-12 h-12 bg-orange-600/30 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">↔️</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Transfer Tickets</h3>
            <p className="text-gray-400">
              Swap tickets between users with complete audit trails and automatic record
              updates for both parties.
            </p>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <div className="w-12 h-12 bg-orange-600/30 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">✅</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Mark Attendance</h3>
            <p className="text-gray-400">
              Simplified attendance marking - just scan or enter ticket ID to mark all team members present at once.
            </p>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <div className="w-12 h-12 bg-orange-600/30 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">🔒</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Secure Authentication</h3>
            <p className="text-gray-400">
              Event-level coordinator authentication ensures only authorized personnel can
              manage tickets.
            </p>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <div className="w-12 h-12 bg-orange-600/30 rounded-lg flex items-center justify-center mb-4">
              <Database className="w-6 h-6 text-orange-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Appwrite Backend</h3>
            <p className="text-gray-400">
              Powered by Appwrite for reliable, scalable, and secure data management.
            </p>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <div className="w-12 h-12 bg-orange-600/30 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">📷</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">QR Code Scanning</h3>
            <p className="text-gray-400">
              Built-in camera support to scan QR codes and auto-fill ticket details for faster processing.
            </p>
          </div>
        </div>

        {/* API Documentation */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6">API Endpoints</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-4 p-4 bg-gray-900 rounded-lg">
              <span className="px-3 py-1 bg-green-600/20 text-green-400 font-mono text-sm rounded border border-green-700">POST</span>
              <code className="text-gray-300 font-mono">/api/tickets/add-member</code>
              <span className="text-gray-500 ml-auto hidden md:block">Add member to ticket</span>
            </div>
            <div className="flex items-center gap-4 p-4 bg-gray-900 rounded-lg">
              <span className="px-3 py-1 bg-green-600/20 text-green-400 font-mono text-sm rounded border border-green-700">POST</span>
              <code className="text-gray-300 font-mono">/api/tickets/swap-ticket</code>
              <span className="text-gray-500 ml-auto hidden md:block">Swap ticket between users</span>
            </div>
            <div className="flex items-center gap-4 p-4 bg-gray-900 rounded-lg">
              <span className="px-3 py-1 bg-orange-600/20 text-orange-400 font-mono text-sm rounded border border-orange-700">GET</span>
              <code className="text-gray-300 font-mono">/api/tickets/info</code>
              <span className="text-gray-500 ml-auto hidden md:block">Get ticket information</span>
            </div>
            <div className="flex items-center gap-4 p-4 bg-gray-900 rounded-lg">
              <span className="px-3 py-1 bg-green-600/20 text-green-400 font-mono text-sm rounded border border-green-700">POST</span>
              <code className="text-gray-300 font-mono">/api/attendance/mark</code>
              <span className="text-gray-500 ml-auto hidden md:block">Mark attendance</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
