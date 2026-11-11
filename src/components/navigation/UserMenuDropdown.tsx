import React from 'react';
import { UserProfile } from '../../types/domain.types';
import { ChevronDown, LogOut } from 'lucide-react';

interface UserMenuDropdownProps {
  user: UserProfile;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  onLogout: () => void;
}

export const UserMenuDropdown: React.FC<UserMenuDropdownProps> = ({
  user,
  isOpen,
  onToggle,
  onClose,
  onLogout,
}) => {
  const firstName = user.fullName.split(' ')[0] || user.email;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className="justi-nav-pill text-xs px-2 sm:px-2.5 flex items-center"
      >
        <span className="max-w-[80px] sm:max-w-none truncate font-bold">
          {firstName}
        </span>
        <ChevronDown className="ml-1 h-3.5 w-3.5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-60 rounded border border-[#9CC2E5] dark:border-slate-700 bg-[#F5FAFF] dark:bg-slate-800 py-1.5 shadow-xl z-50">
          <div className="px-3.5 py-2 border-b border-slate-200 dark:border-slate-700">
            <p className="text-xs font-bold text-[#1B5E91] dark:text-blue-400 truncate">
              {user.fullName}
            </p>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 truncate">
              {user.email}
            </p>
            <div className="mt-1 flex flex-wrap gap-1">
              <span className="rounded bg-[#D9ECFB] dark:bg-slate-700 px-1.5 py-0.5 text-[10px] font-bold text-[#1B5E91] dark:text-blue-300">
                Rol: {user.role}
              </span>
              {user.role === 'MASTER' ? (
                <span className="rounded bg-amber-400 text-slate-900 px-1.5 py-0.5 text-[10px] font-extrabold shadow-xs">
                  GOBERNANZA SAAS
                </span>
              ) : (
                <span className="rounded bg-emerald-100 dark:bg-emerald-950 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-300">
                  {user.branch || 'LOCALES'}
                </span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              onClose();
              onLogout();
            }}
            className="flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-xs font-semibold text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      )}
    </div>
  );
};
