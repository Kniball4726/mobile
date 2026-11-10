import React from 'react';
import { ApiKeyRecord } from '../../../types/domain.types';
import { SystemSettingsCard } from './SystemSettingsCard';
import { ApiKeyCreateCard } from './ApiKeyCreateCard';
import { ApiKeysTable } from './ApiKeysTable';

interface SecurityTabProps {
  maxDiscountInput: number;
  setMaxDiscountInput: (val: number) => void;
  posPaused: boolean;
  setPosPaused: (val: boolean) => void;
  crmPaused: boolean;
  setCrmPaused: (val: boolean) => void;
  loading: boolean;
  onRefresh: () => void;
  onSaveSettings: (e: React.FormEvent) => void;
  onKillSwitch: () => void;
  newKeyName: string;
  setNewKeyName: (val: string) => void;
  selectedScopes: string[];
  toggleScope: (scope: string) => void;
  createdPlaintextKey: string | null;
  copied: boolean;
  onCopyKey: () => void;
  onCreateKey: (e: React.FormEvent) => void;
  apiKeys: ApiKeyRecord[];
  onRevokeKey: (id: string) => void;
}

export const SecurityTab: React.FC<SecurityTabProps> = ({
  maxDiscountInput,
  setMaxDiscountInput,
  posPaused,
  setPosPaused,
  crmPaused,
  setCrmPaused,
  loading,
  onRefresh,
  onSaveSettings,
  onKillSwitch,
  newKeyName,
  setNewKeyName,
  selectedScopes,
  toggleScope,
  createdPlaintextKey,
  copied,
  onCopyKey,
  onCreateKey,
  apiKeys,
  onRevokeKey,
}) => {
  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 1. Configuración Global & Kill-Switch */}
        <SystemSettingsCard
          maxDiscountInput={maxDiscountInput}
          setMaxDiscountInput={setMaxDiscountInput}
          posPaused={posPaused}
          setPosPaused={setPosPaused}
          crmPaused={crmPaused}
          setCrmPaused={setCrmPaused}
          loading={loading}
          onRefresh={onRefresh}
          onSave={onSaveSettings}
          onKillSwitch={onKillSwitch}
        />

        {/* 2. Generador de API Keys Externas */}
        <ApiKeyCreateCard
          newKeyName={newKeyName}
          setNewKeyName={setNewKeyName}
          selectedScopes={selectedScopes}
          toggleScope={toggleScope}
          createdPlaintextKey={createdPlaintextKey}
          copied={copied}
          onCopyKey={onCopyKey}
          onSubmit={onCreateKey}
        />
      </div>

      {/* 3. Tabla de API Keys Registradas */}
      <ApiKeysTable apiKeys={apiKeys} onRevokeKey={onRevokeKey} />
    </div>
  );
};
