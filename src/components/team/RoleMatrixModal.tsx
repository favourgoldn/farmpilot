import { Check, Info, Lock, ShieldCheck, X } from 'lucide-react';
import React from 'react';
import {
  PERMISSION_DEFINITIONS,
  ROLE_DEFAULT_PERMISSIONS,
  TeamRole,
} from '../../types/farm';

interface RoleMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ROLES_LIST: TeamRole[] = [
  'Owner / Director',
  'Farm Operations Lead',
  'Chief Agronomist',
  'Accounts Officer',
  'Field Supervisor',
  'Irrigation Technician',
  'General Farm Hand',
];

export const RoleMatrixModal: React.FC<RoleMatrixModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#181a19]/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-[#181a19]/10 w-full max-w-4xl max-h-[92vh] overflow-y-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#181a19]/10 flex items-start justify-between bg-[#fafaf7] rounded-t-2xl">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm bg-[#16422b]/10 text-[#16422b]">
                Role-Based Access Control (RBAC)
              </span>
              <span className="text-[11px] text-[#181a19]/50 font-mono">
                Security Governance
              </span>
            </div>
            <h3 className="text-xl font-extrabold text-[#181a19] tracking-tight mt-1">
              Role & Permissions Matrix
            </h3>
            <p className="text-xs text-[#181a19]/60 mt-1 max-w-2xl">
              Understand operational authorities across agronomy, field equipment, financial ledgers, and Paystack subscription management.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#181a19]/50 hover:text-[#181a19] hover:bg-black/5 rounded-lg transition-colors shrink-0"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Matrix Table */}
        <div className="p-5 sm:p-6 overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#181a19]/15 text-[11px]">
                <th className="py-3 px-3 font-bold text-[#181a19] bg-[#fafaf7] rounded-l-lg min-w-[200px]">
                  Operational Module / Permission
                </th>
                {ROLES_LIST.map((role) => (
                  <th
                    key={role}
                    className="py-3 px-2.5 font-bold text-[#181a19] text-center min-w-[110px]"
                  >
                    <span className="block leading-tight">{role}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#181a19]/5 text-xs">
              {PERMISSION_DEFINITIONS.map((perm) => (
                <tr key={perm.key} className="hover:bg-[#fafaf7]/60 transition-colors">
                  <td className="py-3 px-3">
                    <p className="font-bold text-[#181a19]">{perm.label}</p>
                    <p className="text-[11px] text-[#181a19]/60 mt-0.5 line-clamp-1">
                      {perm.description}
                    </p>
                  </td>

                  {ROLES_LIST.map((role) => {
                    const hasAccess = ROLE_DEFAULT_PERMISSIONS[role].includes(perm.key);
                    return (
                      <td key={role} className="py-3 px-2.5 text-center">
                        {hasAccess ? (
                          <div className="w-6 h-6 rounded-full bg-emerald-100 text-[#16422b] flex items-center justify-center mx-auto">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-black/5 text-[#181a19]/30 flex items-center justify-center mx-auto">
                            <span className="text-[11px] font-mono leading-none">—</span>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Informative Guidance Footer */}
        <div className="p-5 border-t border-[#181a19]/10 bg-[#fafaf7] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#181a19]/70 rounded-b-2xl">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-[#16422b] shrink-0" />
            <span>
              On <strong>Commercial Grower</strong> and <strong>Enterprise</strong> plans, you can also customize individual permissions per member.
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#16422b] hover:bg-[#143826] rounded-lg transition-colors"
          >
            Close Matrix
          </button>
        </div>
      </div>
    </div>
  );
};
