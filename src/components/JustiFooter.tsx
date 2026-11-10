import React from 'react';

interface JustiFooterProps {
  className?: string;
}

export const JustiFooter: React.FC<JustiFooterProps> = ({ className = '' }) => {
  return (
    <footer
      className={`py-3 text-center text-[10px] sm:text-[11px] font-medium text-slate-600 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 transition-colors ${className}`}
    >
      Copyright ©2026 JustiMobile™ - Todos y cada uno de los derechos reservados
    </footer>
  );
};
