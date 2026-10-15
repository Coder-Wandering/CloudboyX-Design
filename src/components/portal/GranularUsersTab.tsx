import React, { useState } from 'react';
import {
  Users,
  Shield,
  UserCheck,
  Plus,
  Search,
  CheckCircle2,
  Lock,
  Eye,
  Sliders,
  Sparkles,
  HelpCircle,
  Mail,
  UserPlus,
  ArrowRight,
  Check,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { GranularRole, ROLE_PERMISSIONS } from '../../types';

export interface PortalUserItem {
  id: string;
  email: string;
  displayName: string;
  role: GranularRole;
  createdAt: string;
  status: 'active' | 'pending';
  organization?: string;
}

interface GranularUsersTabProps {
  usersList: PortalUserItem[];
  onUpdateUserRole: (userId: string, role: GranularRole) => Promise<void>;
  onAddUser: (user: Omit<PortalUserItem, 'id' | 'createdAt' | 'status'>) => void;
}

export const GranularUsersTab: React.FC<GranularUsersTabProps> = ({
  usersList,
  onUpdateUserRole,
  onAddUser,
}) => {
  const { user, activeRole, simulatedRole, setSimulatedRole, isAdmin } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteOrg, setInviteOrg] = useState('');
  const [inviteRole, setInviteRole] = useState<GranularRole>('client_editor');
  const [selectedRoleDetail, setSelectedRoleDetail] = useState<GranularRole>('admin');

  const filtered = usersList.filter(
    (u) =>
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.organization && u.organization.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    onAddUser({
      email: inviteEmail.trim(),
      displayName: inviteName.trim() || inviteEmail.split('@')[0],
      role: inviteRole,
      organization: inviteOrg.trim() || 'Client Business',
    });

    setInviteEmail('');
    setInviteName('');
    setInviteOrg('');
    setShowInviteModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Role Simulator Bar */}
      <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Role-Based Access Control (RBAC)
            </span>
            <span className="text-xs text-slate-400">
              4 Granular Tiers with Isolated Permissions
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Granular Client & Team Permissions
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Assign exact operational capabilities to agency staff and clients. Clients can edit text and view traffic without touching critical agency billing or publishing gates.
          </p>
        </div>

        {/* Role Simulator Widget */}
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex flex-col sm:flex-row sm:items-center gap-2.5 shrink-0">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-bold text-slate-200">Role Simulator:</span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => setSimulatedRole(null)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                simulatedRole === null
                  ? 'bg-violet-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white bg-slate-950/60'
              }`}
            >
              Default (Admin)
            </button>
            <button
              type="button"
              onClick={() => setSimulatedRole('agency_team')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                simulatedRole === 'agency_team'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white bg-slate-950/60'
              }`}
            >
              Agency Team
            </button>
            <button
              type="button"
              onClick={() => setSimulatedRole('client_editor')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                simulatedRole === 'client_editor'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white bg-slate-950/60'
              }`}
            >
              Client Editor
            </button>
            <button
              type="button"
              onClick={() => setSimulatedRole('client_readonly')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                simulatedRole === 'client_readonly'
                  ? 'bg-slate-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white bg-slate-950/60'
              }`}
            >
              Client Read-Only
            </button>
          </div>
        </div>
      </div>

      {/* Role Presets Visual Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {(Object.keys(ROLE_PERMISSIONS) as GranularRole[]).map((roleKey) => {
          const perm = ROLE_PERMISSIONS[roleKey];
          const isSelected = selectedRoleDetail === roleKey;
          return (
            <div
              key={roleKey}
              onClick={() => setSelectedRoleDetail(roleKey)}
              className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-900 border-indigo-500/80 ring-2 ring-indigo-500/20'
                  : 'bg-slate-950 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${perm.badgeColor}`}>
                    {perm.label}
                  </span>
                  {activeRole === roleKey && (
                    <span className="text-[10px] font-mono text-indigo-400 bg-indigo-950/60 px-1.5 py-0.5 rounded border border-indigo-800">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {perm.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Edit Canvas Content:</span>
                  <span className={perm.canEditDesign ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                    {perm.canEditDesign ? '✓ Allowed' : '— Restricted'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Publish Production:</span>
                  <span className={perm.canPublish ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                    {perm.canPublish ? '✓ Allowed' : '— Restricted'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Manage Billing & Rates:</span>
                  <span className={perm.canManageInvoices ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                    {perm.canManageInvoices ? '✓ Full Admin' : '— Restricted'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Direct Code Export:</span>
                  <span className={perm.canAccessCode ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                    {perm.canAccessCode ? '✓ Allowed' : '— Restricted'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Directory Search & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by client name, email, or company..."
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
          />
        </div>

        <button
          type="button"
          onClick={() => setShowInviteModal(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition flex items-center gap-2 self-start sm:self-auto shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Invite Client or Staff</span>
        </button>
      </div>

      {/* Users Directory Table */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase font-semibold text-[11px] bg-slate-900/50">
                <th className="py-3.5 px-4">User & Account</th>
                <th className="py-3.5 px-4">Role Assignment</th>
                <th className="py-3.5 px-4">Permissions Scope</th>
                <th className="py-3.5 px-4">Joined</th>
                <th className="py-3.5 px-4 text-right">Quick Change</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((item) => {
                const roleConfig = ROLE_PERMISSIONS[item.role] || ROLE_PERMISSIONS.client_editor;
                return (
                  <tr key={item.id} className="hover:bg-slate-900/40 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 text-white font-bold flex items-center justify-center text-xs">
                          {item.displayName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-white text-xs">{item.displayName}</p>
                          <p className="text-[11px] text-slate-400 font-mono">{item.email}</p>
                          {item.organization && (
                            <span className="text-[10px] text-indigo-300 font-medium">
                              {item.organization}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${roleConfig.badgeColor}`}>
                        {roleConfig.label}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1 text-[10px]">
                        {roleConfig.canEditDesign && (
                          <span className="bg-slate-900 text-slate-300 px-1.5 py-0.5 rounded border border-slate-800">
                            ✏️ Edit Content
                          </span>
                        )}
                        {roleConfig.canPublish && (
                          <span className="bg-slate-900 text-slate-300 px-1.5 py-0.5 rounded border border-slate-800">
                            🚀 Publish
                          </span>
                        )}
                        {roleConfig.canManageInvoices && (
                          <span className="bg-slate-900 text-slate-300 px-1.5 py-0.5 rounded border border-slate-800">
                            💳 Manage Invoices
                          </span>
                        )}
                        {roleConfig.canSubmitTickets && (
                          <span className="bg-slate-900 text-slate-300 px-1.5 py-0.5 rounded border border-slate-800">
                            🎫 Tickets
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                      {item.createdAt}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <select
                        value={item.role}
                        onChange={(e) =>
                          onUpdateUserRole(item.id, e.target.value as GranularRole)
                        }
                        className="bg-slate-900 border border-slate-700 text-white rounded-lg px-2 py-1 text-xs focus:outline-hidden focus:border-indigo-500"
                      >
                        <option value="admin">Agency Admin</option>
                        <option value="agency_team">Agency Team</option>
                        <option value="client_editor">Client Editor</option>
                        <option value="client_readonly">Client Read-Only</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <h3 className="text-lg font-bold text-white mb-1">Invite Client or Team Member</h3>
            <p className="text-xs text-slate-400 mb-4">
              Add a new client account to access their dedicated white-label portal.
            </p>

            <form onSubmit={handleInviteSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="client@clientcompany.com"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Organization / Client Project</label>
                <input
                  type="text"
                  value={inviteOrg}
                  onChange={(e) => setInviteOrg(e.target.value)}
                  placeholder="e.g. Lumina Health Clinic"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Role Preset</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as GranularRole)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-hidden focus:border-indigo-500"
                >
                  <option value="client_editor">Client Editor (Can edit content, text, images)</option>
                  <option value="client_readonly">Client Read-Only (Preview & Analytics only)</option>
                  <option value="agency_team">Agency Team (Staff Designer / Project Manager)</option>
                  <option value="admin">Agency Admin (Full System Ownership)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/20 transition flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Send Portal Invitation</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
