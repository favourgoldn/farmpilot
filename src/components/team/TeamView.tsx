import {
  AlertCircle,
  CheckCircle2,
  Edit2,
  Eye,
  Info,
  Mail,
  MoreVertical,
  Phone,
  Plus,
  Shield,
  ShieldCheck,
  Trash2,
  UserCheck,
  Users,
  Zap,
} from 'lucide-react';
import React, { useState } from 'react';
import { useFarm } from '../../context/FarmContext';
import {
  PERMISSION_DEFINITIONS,
  ROLE_DEFAULT_PERMISSIONS,
  SUBSCRIPTION_PLANS,
  TeamMember,
  TeamRole,
} from '../../types/farm';

export const TeamView: React.FC = () => {
  const {
    team,
    openModal,
    currentPlan,
    planLimits,
    openUpgradeModal,
    activeSimulatedRole,
    setActiveSimulatedRole,
    hasPermission,
    openEditTeamMember,
    deleteTeamMember,
    setIsRoleMatrixOpen,
  } = useFarm();

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const canManageTeam = hasPermission('manage_team');
  const seatsUsed = team.length;
  const maxSeats = planLimits.maxTeamMembers;
  const isNearLimit = maxSeats !== Infinity && seatsUsed >= maxSeats;
  const usagePercentage = maxSeats === Infinity ? 25 : Math.min(100, Math.round((seatsUsed / maxSeats) * 100));

  const roleColors: Record<TeamRole, { bg: string; text: string; border: string }> = {
    'Owner / Director': { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
    'Farm Operations Lead': { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200' },
    'Chief Agronomist': { bg: 'bg-teal-50', text: 'text-teal-800', border: 'border-teal-200' },
    'Poultry Section Manager': { bg: 'bg-orange-50', text: 'text-orange-800', border: 'border-orange-200' },
    'Accounts Officer': { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200' },
    'Field Supervisor': { bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-200' },
    'Irrigation Technician': { bg: 'bg-cyan-50', text: 'text-cyan-800', border: 'border-cyan-200' },
    'General Farm Hand': { bg: 'bg-stone-100', text: 'text-stone-800', border: 'border-stone-200' },
  };

  const simulatedRoles: TeamRole[] = [
    'Owner / Director',
    'Farm Operations Lead',
    'Chief Agronomist',
    'Poultry Section Manager',
    'Accounts Officer',
    'Field Supervisor',
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-[#181a19] tracking-tight">Farm Team & Permissions</h2>
            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-sm bg-emerald-100 text-[#16422b]">
              RBAC Enabled
            </span>
          </div>
          <p className="text-xs text-[#181a19]/60 mt-0.5">
            Manage operational roles, agronomic responsibilities, financial authorities, and Paystack billing
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsRoleMatrixOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#181a19] bg-white hover:bg-[#fafaf7] border border-[#181a19]/15 rounded-lg transition-colors shadow-xs"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#16422b]" />
            <span>Permissions Matrix</span>
          </button>

          <button
            onClick={() => {
              if (isNearLimit) {
                openUpgradeModal('team');
              } else {
                openModal('add_team');
              }
            }}
            disabled={!canManageTeam}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#16422b] hover:bg-[#143826] rounded-lg transition-colors shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
            title={!canManageTeam ? 'Permission Required: Team Management' : undefined}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Invite Member</span>
          </button>
        </div>
      </div>

      {/* Subscription Team Capacity Meter & Simulation Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Card 1: Subscription Team Seats Usage Meter */}
        <div className="bg-white border border-[#181a19]/10 rounded-xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#181a19] flex items-center gap-1.5">
              <Users className="w-4 h-4 text-[#16422b]" />
              <span>Team Seat Capacity</span>
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-sm bg-[#fafaf7] border border-[#181a19]/10 text-[#181a19]/70">
              {SUBSCRIPTION_PLANS[currentPlan].name}
            </span>
          </div>

          <div className="my-3">
            <div className="flex justify-between items-baseline text-xs mb-1">
              <span className="font-bold text-sm text-[#181a19]">
                {seatsUsed}{' '}
                <span className="text-xs font-normal text-[#181a19]/60">
                  of {maxSeats === Infinity ? 'Unlimited' : `${maxSeats} seats occupied`}
                </span>
              </span>
              <span className="font-mono text-[11px] text-[#16422b] font-semibold">
                {maxSeats === Infinity ? '∞' : `${usagePercentage}%`}
              </span>
            </div>

            <div className="w-full h-2 bg-[#181a19]/5 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all rounded-full ${
                  usagePercentage >= 100
                    ? 'bg-rose-500'
                    : usagePercentage >= 75
                    ? 'bg-amber-500'
                    : 'bg-[#16422b]'
                }`}
                style={{ width: `${maxSeats === Infinity ? 30 : usagePercentage}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#181a19]/5">
            <span className="text-[11px] text-[#181a19]/50">
              {isNearLimit ? 'Plan capacity reached' : 'Available seat slots remaining'}
            </span>
            {maxSeats !== Infinity && (
              <button
                type="button"
                onClick={() => openUpgradeModal('team')}
                className="text-[11px] font-bold text-[#16422b] hover:underline flex items-center gap-1"
              >
                <span>Upgrade Seats</span>
                <Zap className="w-3 h-3 text-amber-500" />
              </button>
            )}
          </div>
        </div>

        {/* Card 2 & 3: Active RBAC Role Preview Simulator */}
        <div className="lg:col-span-2 bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-bold text-[#143826] flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-emerald-700" />
                <span>Active Role Simulator (RBAC Testing Mode)</span>
              </span>
              <p className="text-[11px] text-[#143826]/70 mt-0.5">
                Simulate how the platform behaves for different team roles across your enterprise.
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-[#181a19]/70">Simulating:</span>
              <select
                value={activeSimulatedRole}
                onChange={(e) => setActiveSimulatedRole(e.target.value as TeamRole)}
                className="bg-white border border-[#181a19]/15 rounded-lg px-2.5 py-1 text-xs font-semibold text-[#16422b] shadow-2xs focus:outline-none focus:border-[#16422b]"
              >
                {simulatedRoles.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-emerald-500/15 flex flex-wrap items-center gap-1.5 text-[11px]">
            <span className="text-[#143826]/70 font-medium">Active Capabilities:</span>
            {PERMISSION_DEFINITIONS.map((perm) => {
              const active = hasPermission(perm.key);
              return (
                <span
                  key={perm.key}
                  className={`px-2 py-0.5 rounded-full text-[10px] font-medium transition-all ${
                    active
                      ? 'bg-emerald-100 text-[#143826] font-semibold border border-emerald-300'
                      : 'bg-black/5 text-[#181a19]/40 line-through opacity-60'
                  }`}
                >
                  {perm.label.split(' ')[0]}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* Team Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {team.map((member) => {
          const color = roleColors[member.role] || roleColors['Field Supervisor'];
          const memberPerms =
            member.permissions || ROLE_DEFAULT_PERMISSIONS[member.role] || [];

          return (
            <div
              key={member.id}
              className="bg-white border border-[#181a19]/10 rounded-xl p-5 shadow-xs flex flex-col justify-between hover:border-[#16422b]/30 transition-all group"
            >
              <div>
                {/* Card Top Banner */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  {member.avatarUrl ? (
                    <img
                      src={member.avatarUrl}
                      alt={member.name}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-full object-cover border border-[#16422b]/20"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-[#16422b]/10 text-[#16422b] font-bold text-sm flex items-center justify-center">
                      {member.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </div>
                  )}

                  <div className="flex items-center gap-1">
                    {member.isOwner && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-xs bg-amber-100 text-amber-800">
                        OWNER
                      </span>
                    )}
                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-sm ${
                        member.activeStatus
                          ? 'bg-emerald-100 text-[#16422b]'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {member.activeStatus ? 'ACTIVE' : 'SUSPENDED'}
                    </span>
                  </div>
                </div>

                {/* Identity Info */}
                <h4 className="text-sm font-bold text-[#181a19]">{member.name}</h4>
                <div className="mt-1">
                  <span
                    className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-md border ${color.bg} ${color.text} ${color.border}`}
                  >
                    {member.role}
                  </span>
                </div>
                <p className="text-[11px] text-[#181a19]/50 mt-1">{member.state}</p>

                {/* Contact Data */}
                <div className="mt-3 pt-2.5 border-t border-[#181a19]/5 space-y-1 text-xs text-[#181a19]/70">
                  <div className="flex items-center gap-2 truncate">
                    <Phone className="w-3.5 h-3.5 text-[#181a19]/40 shrink-0" />
                    <span className="truncate font-mono text-[11px]">{member.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 truncate">
                    <Mail className="w-3.5 h-3.5 text-[#181a19]/40 shrink-0" />
                    <span className="truncate text-[11px]">{member.email}</span>
                  </div>
                </div>

                {/* Permissions Breakdown Badges */}
                <div className="mt-3 pt-2.5 border-t border-[#181a19]/5">
                  <span className="text-[10px] uppercase font-semibold text-[#181a19]/50 block mb-1">
                    Granted Permissions ({memberPerms.length})
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {memberPerms.slice(0, 3).map((p) => (
                      <span
                        key={p}
                        className="text-[9.5px] px-1.5 py-0.2 rounded-xs bg-[#fafaf7] text-[#181a19]/80 border border-[#181a19]/10"
                      >
                        {p.replace('manage_', '').replace('_', ' ')}
                      </span>
                    ))}
                    {memberPerms.length > 3 && (
                      <span className="text-[9.5px] px-1.5 py-0.2 rounded-xs bg-[#16422b]/5 text-[#16422b] font-medium">
                        +{memberPerms.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Footer: Assigned Farm & Actions */}
              <div className="mt-4 pt-3 border-t border-[#181a19]/5">
                <div className="text-[10.5px] text-[#181a19]/50 mb-3 truncate">
                  Estate: {member.assignedFarms.join(', ')}
                </div>

                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => openEditTeamMember(member)}
                    disabled={!canManageTeam}
                    className="flex-1 py-1.5 px-2 text-xs font-semibold text-[#16422b] bg-[#16422b]/5 hover:bg-[#16422b]/15 rounded-lg transition-colors flex items-center justify-center gap-1 disabled:opacity-40"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Edit Role</span>
                  </button>

                  {!member.isOwner && canManageTeam && (
                    <button
                      type="button"
                      onClick={() => {
                        if (confirmDeleteId === member.id) {
                          deleteTeamMember(member.id);
                          setConfirmDeleteId(null);
                        } else {
                          setConfirmDeleteId(member.id);
                          setTimeout(() => setConfirmDeleteId(null), 3000);
                        }
                      }}
                      className={`p-1.5 rounded-lg transition-colors ${
                        confirmDeleteId === member.id
                          ? 'bg-rose-500 text-white text-[10px] px-2 font-bold'
                          : 'text-[#181a19]/40 hover:text-rose-600 hover:bg-rose-50'
                      }`}
                      title="Remove Member"
                    >
                      {confirmDeleteId === member.id ? 'Confirm?' : <Trash2 className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
