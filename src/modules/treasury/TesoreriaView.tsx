import React, { useState } from 'react';
import { JustiFooter } from '../../components/JustiFooter';
import { TreasuryApi } from '../../services/api/treasury.api';
import {
  BranchType,
  CashOperationRecord,
  CashRegisterRecord,
  ClosureSummary,
  TesoreriaTab,
  UserProfile,
} from '../../types/domain.types';
import { AbrirCajaTab } from './components/AbrirCajaTab';
import { ArqueoCierreModal } from './components/ArqueoCierreModal';
import { CajasListTab } from './components/CajasListTab';
import { NuevoGastoTab } from './components/NuevoGastoTab';
import { OperacionCajaTab } from './components/OperacionCajaTab';

interface TesoreriaViewProps {
  token?: string;
  user: UserProfile;
  activeTab: TesoreriaTab;
  onChangeTab: (tab: TesoreriaTab) => void;
  registers: CashRegisterRecord[];
  operations: CashOperationRecord[];
  onOpenRegister: (
    boxType: 'Ventas Sucursal' | 'Caja Consolidada',
    observations: string,
  ) => void;
  onCloseRegister: (
    id: string,
    payload?: { declaredCash?: number; observations?: string },
  ) => Promise<void> | void;
  onRegisterOperation: (
    op: Omit<CashOperationRecord, 'id' | 'createdAt'>,
  ) => void;
}

export const TesoreriaView: React.FC<TesoreriaViewProps> = ({
  token,
  user,
  activeTab,
  onChangeTab,
  registers,
  operations,
  onOpenRegister,
  onCloseRegister,
  onRegisterOperation,
}) => {
  const assignedBranch: BranchType = user.branch || 'LOCALES';
  const isBranchLocked = user.role !== 'ADMIN' && user.role !== 'MASTER';
  const canOperateCash = user.role === 'CASHIER' || user.role === 'MASTER';
  const canCloseRegisters =
    user.role === 'CASHIER' ||
    user.role === 'ADMIN' ||
    user.role === 'MASTER';
  const [selectedBranch, setSelectedBranch] =
    useState<BranchType>(assignedBranch);
  const effectiveBranch: BranchType = isBranchLocked
    ? assignedBranch
    : selectedBranch;

  // Estados de formularios
  const [boxType, setBoxType] = useState<'Ventas Sucursal' | 'Caja Consolidada'>(
    'Ventas Sucursal',
  );
  const [openObservations, setOpenObservations] = useState('');

  const [opType, setOpType] = useState<
    | 'INGRESO_EXTRAORDINARIO'
    | 'EGRESO_EXTRAORDINARIO'
    | 'TRANSFERENCIA_CAJAS'
  >('INGRESO_EXTRAORDINARIO');
  const [opAmount, setOpAmount] = useState('');
  const [opDetail, setOpDetail] = useState('');

  const [expenseAmount, setExpenseAmount] = useState('0.00');
  const [expenseCategory, setExpenseCategory] = useState(
    'Gastos Varios Sucursal',
  );
  const [expenseDetail, setExpenseDetail] = useState('');

  const [feedback, setFeedback] = useState<string | null>(null);

  // Estados para Arqueo y Modal de Cierre de Caja
  const [summaryModalOpen, setSummaryModalOpen] = useState(false);
  const [selectedRegisterForSummary, setSelectedRegisterForSummary] =
    useState<CashRegisterRecord | null>(null);
  const [currentSummary, setCurrentSummary] = useState<ClosureSummary | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [declaredCashInput, setDeclaredCashInput] = useState<string>('');
  const [closeObservationsInput, setCloseObservationsInput] = useState<string>('');
  const [isReadOnlyView, setIsReadOnlyView] = useState(false);
  const [isSubmittingClose, setIsSubmittingClose] = useState(false);

  const handleOpenCloseModal = async (reg: CashRegisterRecord) => {
    setSelectedRegisterForSummary(reg);
    setIsReadOnlyView(false);
    setCloseObservationsInput(reg.observations || '');
    setSummaryError(null);
    setSummaryModalOpen(true);

    if (token) {
      setLoadingSummary(true);
      try {
        const sum = await TreasuryApi.getRegisterSummary(token, reg.id);
        setCurrentSummary(sum);
        setDeclaredCashInput(sum.expectedCash.toFixed(2));
      } catch (err: unknown) {
        console.error('Error al obtener arqueo de caja:', err);
        setSummaryError(
          err instanceof Error
            ? err.message
            : 'No se pudo obtener el arqueo preliminar de la caja.',
        );
      } finally {
        setLoadingSummary(false);
      }
    } else {
      setDeclaredCashInput(reg.currentBalance.toFixed(2));
    }
  };

  const handleViewSummaryModal = async (reg: CashRegisterRecord) => {
    setSelectedRegisterForSummary(reg);
    setIsReadOnlyView(true);
    setSummaryError(null);
    setSummaryModalOpen(true);

    if (reg.closureSummary) {
      setCurrentSummary(reg.closureSummary);
      setDeclaredCashInput(reg.closureSummary.declaredCash.toFixed(2));
      return;
    }

    if (token) {
      setLoadingSummary(true);
      try {
        const sum = await TreasuryApi.getRegisterSummary(token, reg.id);
        setCurrentSummary(sum);
        setDeclaredCashInput(sum.declaredCash.toFixed(2));
      } catch (err: unknown) {
        console.error('Error al consultar arqueo guardado:', err);
        setSummaryError(
          err instanceof Error
            ? err.message
            : 'No se pudo cargar el desglose de cierre guardado.',
        );
      } finally {
        setLoadingSummary(false);
      }
    }
  };

  const handleConfirmClose = async () => {
    if (!selectedRegisterForSummary) return;
    setIsSubmittingClose(true);
    try {
      const declaredNum = Number(declaredCashInput) || 0;
      await onCloseRegister(selectedRegisterForSummary.id, {
        declaredCash: declaredNum,
        observations: closeObservationsInput.trim(),
      });
      setSummaryModalOpen(false);
      setFeedback(
        `Caja cerrada exitosamente. Se guardó el arqueo de formas de pago y las ventas del vendedor se reiniciaron a 0.`,
      );
    } catch (err: unknown) {
      alert(
        err instanceof Error
          ? err.message
          : 'Error al procesar el cierre de caja.',
      );
    } finally {
      setIsSubmittingClose(false);
    }
  };

  const openRegisters = registers.filter((r) => r.status === 'ABIERTA');

  const handleSaveOpenCaja = (e: React.FormEvent) => {
    e.preventDefault();
    onOpenRegister(boxType, openObservations);
    setOpenObservations('');
    setFeedback(
      `Caja "${boxType}" abierta correctamente para la sucursal ${effectiveBranch}.`,
    );
    onChangeTab('CAJAS');
  };

  const handleSaveOperation = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = Number(opAmount) || 0;
    if (amountNum <= 0) return;
    onRegisterOperation({
      type: opType,
      amount: amountNum,
      detail: opDetail || 'Operación de Tesorería',
      branch: effectiveBranch,
    });
    setOpAmount('');
    setOpDetail('');
    setFeedback('Operación de caja registrada exitosamente.');
  };

  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = Number(expenseAmount) || 0;
    if (amountNum <= 0 || !expenseDetail.trim()) return;
    onRegisterOperation({
      type: 'GASTO',
      amount: amountNum,
      category: expenseCategory,
      detail: expenseDetail.trim(),
      branch: effectiveBranch,
    });
    setExpenseAmount('0.00');
    setExpenseDetail('');
    setFeedback(
      `Gasto registrado y descontado del saldo de Caja ${effectiveBranch}.`,
    );
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-44px)] bg-[#F7FBFF] pb-16 sm:pb-4">
      {/* Sub-navegación: si es ADMIN, solo ve Auditoría de Cajas */}
      {canOperateCash ? (
        <div className="bg-[#DCEAF7] border-b border-[#9CC2E5] p-2 sm:px-3 sm:py-1.5 grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-1.5 text-xs">
          <button
            type="button"
            onClick={() => {
              setFeedback(null);
              onChangeTab('CAJAS');
            }}
            className={`justi-btn-primary py-2 sm:py-1 ${
              activeTab === 'CAJAS' ? 'ring-2 ring-[#1B5E91] font-bold' : ''
            }`}
          >
            Cajas (Consulta)
          </button>
          <button
            type="button"
            onClick={() => {
              setFeedback(null);
              onChangeTab('ABRIR_CAJA');
            }}
            className={`justi-btn-primary py-2 sm:py-1 ${
              activeTab === 'ABRIR_CAJA' ? 'ring-2 ring-[#1B5E91] font-bold' : ''
            }`}
          >
            Abrir Nueva Caja
          </button>
          <button
            type="button"
            onClick={() => {
              setFeedback(null);
              onChangeTab('OPERACION_CAJA');
            }}
            className={`justi-btn-primary py-2 sm:py-1 ${
              activeTab === 'OPERACION_CAJA'
                ? 'ring-2 ring-[#1B5E91] font-bold'
                : ''
            }`}
          >
            Operación de Caja
          </button>
          <button
            type="button"
            onClick={() => {
              setFeedback(null);
              onChangeTab('NUEVO_GASTO');
            }}
            className={`justi-btn-primary py-2 sm:py-1 ${
              activeTab === 'NUEVO_GASTO' ? 'ring-2 ring-[#1B5E91] font-bold' : ''
            }`}
          >
            Nuevo Gasto
          </button>
        </div>
      ) : (
        <div className="bg-[#DCEAF7] border-b border-[#9CC2E5] px-4 py-2 text-xs font-semibold text-[#1B5E91]">
          Modo Supervisión y Auditoría Contable (Solo Lectura) — Las operaciones de caja son exclusivas de los cajeros.
        </div>
      )}

      {/* PANTALLA 1: CAJAS */}
      {(activeTab === 'CAJAS' || !canOperateCash) && (
        <CajasListTab
          registers={registers}
          effectiveBranch={effectiveBranch}
          selectedBranch={selectedBranch}
          setSelectedBranch={setSelectedBranch}
          isBranchLocked={isBranchLocked}
          canOperateCash={canOperateCash}
          canCloseRegisters={canCloseRegisters}
          onNavigateOpenCaja={() => onChangeTab('ABRIR_CAJA')}
          onOpenCloseModal={handleOpenCloseModal}
          onViewSummaryModal={handleViewSummaryModal}
          feedback={feedback}
        />
      )}

      {/* PANTALLA 2: APERTURA DE CAJA */}
      {activeTab === 'ABRIR_CAJA' && (
        <AbrirCajaTab
          user={user}
          effectiveBranch={effectiveBranch}
          selectedBranch={selectedBranch}
          setSelectedBranch={setSelectedBranch}
          isBranchLocked={isBranchLocked}
          boxType={boxType}
          setBoxType={setBoxType}
          openObservations={openObservations}
          setOpenObservations={setOpenObservations}
          onSubmit={handleSaveOpenCaja}
          onCancel={() => onChangeTab('CAJAS')}
        />
      )}

      {/* PANTALLA 3: REGISTRAR OPERACIÓN DE CAJA */}
      {activeTab === 'OPERACION_CAJA' && (
        <OperacionCajaTab
          opType={opType}
          setOpType={setOpType}
          opAmount={opAmount}
          setOpAmount={setOpAmount}
          opDetail={opDetail}
          setOpDetail={setOpDetail}
          onSubmit={handleSaveOperation}
          onCancel={() => onChangeTab('CAJAS')}
          feedback={feedback}
        />
      )}

      {/* PANTALLA 4: NUEVO GASTO */}
      {activeTab === 'NUEVO_GASTO' && (
        <NuevoGastoTab
          effectiveBranch={effectiveBranch}
          selectedBranch={selectedBranch}
          setSelectedBranch={setSelectedBranch}
          isBranchLocked={isBranchLocked}
          openRegisters={openRegisters}
          expenseAmount={expenseAmount}
          setExpenseAmount={setExpenseAmount}
          expenseCategory={expenseCategory}
          setExpenseCategory={setExpenseCategory}
          expenseDetail={expenseDetail}
          setExpenseDetail={setExpenseDetail}
          onSubmit={handleSaveExpense}
          onCancel={() => onChangeTab('CAJAS')}
          feedback={feedback}
        />
      )}

      {/* Modal Arqueo y Cierre de Caja */}
      <ArqueoCierreModal
        isOpen={summaryModalOpen}
        onClose={() => setSummaryModalOpen(false)}
        selectedRegister={selectedRegisterForSummary}
        isReadOnlyView={isReadOnlyView}
        loadingSummary={loadingSummary}
        summaryError={summaryError}
        currentSummary={currentSummary}
        declaredCashInput={declaredCashInput}
        setDeclaredCashInput={setDeclaredCashInput}
        closeObservationsInput={closeObservationsInput}
        setCloseObservationsInput={setCloseObservationsInput}
        onConfirmClose={handleConfirmClose}
        isSubmittingClose={isSubmittingClose}
      />

      <JustiFooter className="mt-8" />
    </div>
  );
};
