import { Check, Info, Lock, ShieldCheck, X } from 'lucide-react';
import React, { useState } from 'react';
import { useFarm } from '../../context/FarmContext';
import {
  PERMISSION_DEFINITIONS,
  PermissionKey,
  ROLE_DEFAULT_PERMISSIONS,
  TeamMember,
  TeamRole,
} from '../../types/farm';

interface EditTeamMemberModalProps {
  member: TeamMember | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, updates: Partial<TeamMember>) => Promise<void>;
}

export const EditTeamMemberModal: React.FC<EditTeamMemberModalProps> = ({
  member,
  isOpen,
  onClose,
  onSave,
}) => {
  const { farms, planLimits } = useFarm();

  const [role, setRole] = useState<TeamRole>(member?.role || 'Field Supervisor');
  const [phone, setPhone] = useState(member?.phone || '');
  const [assignedFarms, setAssignedFarms] = useState<string[]>(
    member?.assignedFarms || [farms[0]?.name || 'Commercial Farm']
  );
  const [activeStatus, setActiveStatus] = useState(member?.activeStatus ?? true);

  // Initialize permissions from member or role defaults
  const [permissions, setPermissions] = useState<PermissionKey[]>(
    member?.permissions || ROLE_DEFAULT_PERMISSIONS[member?.role || 'Field Supervisor'] || []
  );

  // When role changes, if user hasn't explicitly customized, auto-set role defaults
  const handleRoleChange = (newRole: TeamRole) => {
    setRole(newRole);
    setPermissions(ROLE_DEFAULT_PERMISSIONS[newRole] || []);
  };

  const togglePermission = (permKey: PermissionKey) => {
    if (permissions.includes(permKey)) {
      setPermissions(permissions.filter((p) => p !== permKey));
    } else {
      setPermissions([...permissions, permKey]);
    }
  };

  const handleFarmToggle = (farmName: string) => {
    if (assignedFarms.includes(farmName)) {
      if (assignedFarms.length > 1) {
        setAssignedFarms(assignedFarms.filter((f) => f !== farmName));
      }
    } else {
      setAssignedFarms([...assignedFarms, farmName]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!member) return;

    await onSave(member.id, {
      role,
      phone,
      assignedFarms,
      activeStatus,
      permissions,
    });
    onClose();
  };

  if (!isOpen || !member) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#181a19]/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-[#181a19]/10 w-full max-w-xl max-h-[92vh] overflow-y-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-[#181a19]/10 flex items-center justify-between bg-[#fafaf7] rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#16422b]/10 text-[#16422b] font-bold flex items-center justify-center">
              {member.name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </div>
            <div>
              <h3 className="text-base font-bold text-[#181a19]">
                Edit Team Member & Permissions
              </h3>
              <p className="text-xs text-[#181a19]/60">
                {member.name} ({member.email})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#181a19]/50 hover:text-[#181a19] hover:bg-black/5 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 text-xs text-[#181a19]">
          {/* Role Selection */}
          <div>
            <label className="block font-semibold text-[#181a19]/80 mb-1">
              Operational Role *
            </label>
            <select
              value={role}
              onChange={(e) => handleRoleChange(e.target.value as TeamRole)}
              className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2.5 text-xs font-medium focus:outline-none focus:border-[#16422b]"
            >
              <option value="Owner / Director">Owner / Director (Full Unrestricted Access)</option>
              <option value="Farm Operations Lead">Farm Operations Lead (Farms, Crops, Inventory, Tasks)</option>
              <option value="Chief Agronomist">Chief Agronomist (Agronomy Cycles, Fields & Harvests)</option>
              <option value="Accounts Officer">Accounts Officer (Expenses, Invoices, Receipts & Receivables)</option>
              <option value="Field Supervisor">Field Supervisor (Field Operations & Dispatch)</option>
              <option value="Irrigation Technician">Irrigation Technician (Infrastructure & Plots)</option>
              <option value="General Farm Hand">General Farm Hand (Task Execution)</option>
            </select>
          </div>

          {/* Granular Permissions Matrix Section */}
          <div className="space-y-3 pt-2 border-t border-[#181a19]/10">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-xs text-[#181a19] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#16422b]" />
                  <span>Granular Access Permissions ({permissions.length} Active)</span>
                </h4>
                <p className="text-[11px] text-[#181a19]/60">
                  Toggle fine-grained access modules for this team member.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setPermissions(ROLE_DEFAULT_PERMISSIONS[role] || [])}
                className="text-[11px] font-semibold text-[#16422b] hover:underline"
              >
                Reset to Role Defaults
              </button>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {PERMISSION_DEFINITIONS.map((perm) => {
                const isChecked = permissions.includes(perm.key);
                return (
                  <label
                    key={perm.key}
                    className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                      isChecked
                        ? 'bg-emerald-500/5 border-emerald-600/30 text-[#143826]'
                        : 'bg-[#fafaf7] border-[#181a19]/10 text-[#181a19]/70 hover:border-[#181a19]/20'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => togglePermission(perm.key)}
                      className="mt-0.5 rounded text-[#16422b] focus:ring-[#16422b]"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs">{perm.label}</span>
                        <span className="text-[9px] uppercase font-mono px-1.5 py-0.2 rounded-xs bg-black/5 text-[#181a19]/60">
                          {perm.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#181a19]/60 mt-0.5">
                        {perm.description}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Assigned Farms Estate */}
          <div className="pt-2 border-t border-[#181a19]/10">
            <label className="block font-semibold text-[#181a19]/80 mb-1.5">
              Assigned Farm Estate(s)
            </label>
            <div className="flex flex-wrap gap-2">
              {farms.map((farm) => {
                const isAssigned = assignedFarms.includes(farm.name);
                return (
                  <button
                    key={farm.id}
                    type="button"
                    onClick={() => handleFarmToggle(farm.name)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      isAssigned
                        ? 'bg-[#16422b] text-white border-[#16422b]'
                        : 'bg-[#fafaf7] text-[#181a19]/70 border-[#181a19]/15 hover:border-[#181a19]/30'
                    }`}
                  >
                    {farm.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Phone Number & Active Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#181a19]/10">
            <div>
              <label className="block font-medium text-[#181a19]/80 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#16422b]"
              />
            </div>

            <div>
              <label className="block font-medium text-[#181a19]/80 mb-1">
                Member Status
              </label>
              <select
                value={activeStatus ? 'active' : 'inactive'}
                onChange={(e) => setActiveStatus(e.target.value === 'active')}
                className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#16422b]"
              >
                <option value="active">Active (Access Granted)</option>
                <option value="inactive">Inactive / Suspended (Access Revoked)</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-[#181a19]/10 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#181a19]/70 hover:text-[#181a19] bg-[#fafaf7] hover:bg-black/5 rounded-lg border border-[#181a19]/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-[#16422b] hover:bg-[#143826] rounded-lg transition-colors shadow-xs"
            >
              Save Permissions & Role
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
