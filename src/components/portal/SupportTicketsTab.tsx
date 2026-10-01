import React, { useState } from 'react';
import {
  LifeBuoy,
  Plus,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  Send,
  User,
  ChevronRight,
  Filter,
  Check,
  Tag,
  Shield,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ClientSupportTicket } from '../../types';

interface SupportTicketsTabProps {
  tickets: ClientSupportTicket[];
  onAddTicket: (ticket: Omit<ClientSupportTicket, 'id' | 'createdAt' | 'updatedAt' | 'messages'>) => void;
  onUpdateTicketStatus: (ticketId: string, status: ClientSupportTicket['status']) => void;
  onSendMessage: (ticketId: string, text: string) => void;
}

export const SupportTicketsTab: React.FC<SupportTicketsTabProps> = ({
  tickets,
  onAddTicket,
  onUpdateTicketStatus,
  onSendMessage,
}) => {
  const { user, activeRole, isAgencyTeam, agencyBranding } = useAuth();
  const [activeFilter, setActiveFilter] = useState<'all' | 'Open' | 'In Progress' | 'Resolved'>('all');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(tickets[0]?.id || null);
  const [showNewModal, setShowNewModal] = useState(false);

  // New ticket state
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState<ClientSupportTicket['category']>('Design Revision');
  const [newPriority, setNewPriority] = useState<ClientSupportTicket['priority']>('Medium');

  // Reply message state
  const [replyText, setReplyText] = useState('');

  const filteredTickets = tickets.filter((t) => {
    if (activeFilter === 'all') return true;
    return t.status === activeFilter;
  });

  const selectedTicket = tickets.find((t) => t.id === selectedTicketId) || filteredTickets[0];

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim()) return;

    onAddTicket({
      title: newTitle.trim(),
      description: newDesc.trim(),
      category: newCategory,
      priority: newPriority,
      status: 'Open',
      clientId: user?.uid || 'client-local',
      clientEmail: user?.email || 'client@example.com',
      clientName: user?.displayName || 'Client Account',
    });

    setNewTitle('');
    setNewDesc('');
    setShowNewModal(false);
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;
    onSendMessage(selectedTicket.id, replyText.trim());
    setReplyText('');
  };

  const getPriorityBadge = (priority: ClientSupportTicket['priority']) => {
    switch (priority) {
      case 'Urgent':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      case 'High':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'Medium':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'Low':
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  const getStatusBadge = (status: ClientSupportTicket['status']) => {
    switch (status) {
      case 'Resolved':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'In Progress':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
      case 'Waiting on Client':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'Open':
      default:
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    }
  };

  const openCount = tickets.filter((t) => t.status === 'Open').length;
  const progressCount = tickets.filter((t) => t.status === 'In Progress').length;
  const resolvedCount = tickets.filter((t) => t.status === 'Resolved').length;

  return (
    <div className="space-y-6">
      {/* Top Banner & Stats */}
      <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Support & Revision Desk
            </span>
            <span className="text-xs text-slate-400">
              Direct Communication with {agencyBranding.agencyName}
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Client Change Requests & Tickets
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Submit new section ideas, copy revisions, or report issues. Our design team responds within standard SLA windows.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs bg-slate-900 px-3.5 py-2 rounded-xl border border-slate-800">
            <span className="text-slate-400 font-medium">Status:</span>
            <span className="text-blue-400 font-bold">{openCount} Open</span>
            <span className="text-slate-600">|</span>
            <span className="text-indigo-400 font-bold">{progressCount} In Progress</span>
            <span className="text-slate-600">|</span>
            <span className="text-emerald-400 font-bold">{resolvedCount} Resolved</span>
          </div>

          <button
            type="button"
            onClick={() => setShowNewModal(true)}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md shadow-amber-500/20 transition flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>New Request</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        {(['all', 'Open', 'In Progress', 'Resolved'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveFilter(tab)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeFilter === tab
                ? 'bg-slate-800 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab === 'all' ? 'All Tickets' : tab}
          </button>
        ))}
      </div>

      {/* Ticket List and Detail Panel Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[480px]">
        {/* Tickets List */}
        <div className="lg:col-span-5 space-y-3">
          {filteredTickets.length === 0 ? (
            <div className="p-8 text-center bg-slate-950 border border-slate-800 rounded-2xl text-slate-400 text-xs">
              No tickets found matching this filter.
            </div>
          ) : (
            filteredTickets.map((ticket) => {
              const isSelected = selectedTicket?.id === ticket.id;
              return (
                <div
                  key={ticket.id}
                  onClick={() => setSelectedTicketId(ticket.id)}
                  className={`p-4 rounded-2xl border transition cursor-pointer text-left ${
                    isSelected
                      ? 'bg-slate-900 border-indigo-500/80 ring-2 ring-indigo-500/20'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getPriorityBadge(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(ticket.status)}`}>
                      {ticket.status}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-white line-clamp-1 mb-1">
                    {ticket.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-3">
                    {ticket.description}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-800/80">
                    <span className="flex items-center gap-1 font-mono">
                      <Tag className="w-3 h-3 text-slate-400" />
                      <span>{ticket.category}</span>
                    </span>
                    <span>{ticket.messages.length} replies</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Selected Ticket Conversation Thread */}
        <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col justify-between overflow-hidden shadow-sm">
          {selectedTicket ? (
            <>
              {/* Header */}
              <div className="p-5 border-b border-slate-800 bg-slate-900/40">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${getPriorityBadge(selectedTicket.priority)}`}>
                      {selectedTicket.priority} Priority
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      #{selectedTicket.id}
                    </span>
                  </div>

                  {/* Status Dropdown (Agency Team or Admin can update) */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Status:</span>
                    <select
                      value={selectedTicket.status}
                      onChange={(e) =>
                        onUpdateTicketStatus(
                          selectedTicket.id,
                          e.target.value as ClientSupportTicket['status']
                        )
                      }
                      className="bg-slate-900 border border-slate-700 text-white rounded-lg px-2 py-1 text-xs focus:outline-hidden focus:border-indigo-500"
                    >
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Waiting on Client">Waiting on Client</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </div>
                </div>

                <h3 className="text-base font-bold text-white mb-1">
                  {selectedTicket.title}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  {selectedTicket.description}
                </p>

                <div className="flex items-center gap-4 text-[11px] text-slate-400 mt-3">
                  <span>Client: <strong className="text-white">{selectedTicket.clientName}</strong></span>
                  <span>Category: <strong className="text-indigo-400">{selectedTicket.category}</strong></span>
                </div>
              </div>

              {/* Thread Messages */}
              <div className="p-5 flex-1 overflow-y-auto space-y-4 max-h-[320px]">
                {selectedTicket.messages.map((msg) => {
                  const isAgency = msg.sender === 'agency';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isAgency ? 'items-start' : 'items-end'}`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 text-[10px] text-slate-400">
                        {isAgency ? (
                          <>
                            <Shield className="w-3 h-3 text-indigo-400" />
                            <span className="font-semibold text-indigo-300">{msg.senderName}</span>
                          </>
                        ) : (
                          <>
                            <User className="w-3 h-3 text-slate-400" />
                            <span className="font-semibold text-slate-300">{msg.senderName}</span>
                          </>
                        )}
                        <span>•</span>
                        <span>{msg.timestamp}</span>
                      </div>

                      <div
                        className={`p-3.5 rounded-2xl max-w-[85%] text-xs leading-relaxed shadow-sm ${
                          isAgency
                            ? 'bg-indigo-950/80 text-indigo-100 border border-indigo-800/80 rounded-tl-xs'
                            : 'bg-slate-800 text-slate-100 border border-slate-700 rounded-tr-xs'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reply Form */}
              <form onSubmit={handleSendReply} className="p-4 border-t border-slate-800 bg-slate-900/60 flex gap-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={
                    isAgencyTeam
                      ? `Reply as ${agencyBranding.agencyName} team...`
                      : 'Send response or attach clarification...'
                  }
                  className="flex-1 px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
                />
                <button
                  type="submit"
                  disabled={!replyText.trim()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs shadow-md shadow-indigo-600/20 transition flex items-center gap-1.5 disabled:opacity-40"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Reply</span>
                </button>
              </form>
            </>
          ) : (
            <div className="p-12 text-center text-slate-400 text-xs">
              Select a ticket from the left panel to inspect discussion history.
            </div>
          )}
        </div>
      </div>

      {/* New Ticket Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <h3 className="text-lg font-bold text-white mb-1">Submit Design Revision or Ticket</h3>
            <p className="text-xs text-slate-400 mb-4">
              Describe what changes or additions you would like our design team to implement.
            </p>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Summary Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Update pricing tier cards and hero headline"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as ClientSupportTicket['category'])}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-hidden focus:border-indigo-500"
                  >
                    <option value="Design Revision">Design Revision</option>
                    <option value="Bug Fix">Bug Fix</option>
                    <option value="Feature Request">Feature Request</option>
                    <option value="Billing & Subscription">Billing & Subscription</option>
                    <option value="Domain & Hosting">Domain & Hosting</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as ClientSupportTicket['priority'])}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-hidden focus:border-indigo-500"
                  >
                    <option value="Low">Low (General question)</option>
                    <option value="Medium">Medium (Scheduled sprint)</option>
                    <option value="High">High (Impending campaign)</option>
                    <option value="Urgent">Urgent (Launch blocking)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Detailed Instructions & Copy</label>
                <textarea
                  rows={4}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Provide explicit wording, image references, or specific block targets..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl shadow-md shadow-amber-500/20 transition flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Submit Ticket</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
