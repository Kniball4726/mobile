import React from 'react';
import { BrandingCustomizerCard } from './BrandingCustomizerCard';
import { CompaniesManagerCard } from './CompaniesManagerCard';

interface CompaniesTabProps {
  token: string;
}

export const CompaniesTab: React.FC<CompaniesTabProps> = ({ token }) => {
  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      {/* 1. Personalización de Marca y Logotipo en Vivo */}
      <BrandingCustomizerCard token={token} />

      {/* 2. Gestión de Empresas Multi-Tenant */}
      <CompaniesManagerCard token={token} />
    </div>
  );
};
