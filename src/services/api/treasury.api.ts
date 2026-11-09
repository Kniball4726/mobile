import {
  CashOperationRecord,
  CashRegisterRecord,
} from '../../types/domain.types';
import { request } from './client';

export const TreasuryApi = {
  listRegisters(
    token: string,
    branch = 'LOCALES',
  ): Promise<CashRegisterRecord[]> {
    return request<CashRegisterRecord[]>(
      `/treasury/registers?branch=${encodeURIComponent(branch)}`,
      { method: 'GET' },
      token,
    );
  },

  openRegister(
    token: string,
    payload: {
      boxType: 'Ventas Sucursal' | 'Caja Consolidada';
      branch?: string;
      observations?: string;
    },
  ): Promise<CashRegisterRecord> {
    return request<CashRegisterRecord>(
      '/treasury/registers/open',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      token,
    );
  },

  closeRegister(token: string, id: string): Promise<CashRegisterRecord> {
    return request<CashRegisterRecord>(
      `/treasury/registers/${encodeURIComponent(id)}/close`,
      { method: 'PATCH' },
      token,
    );
  },

  listOperations(
    token: string,
    branch = 'LOCALES',
  ): Promise<CashOperationRecord[]> {
    return request<CashOperationRecord[]>(
      `/treasury/operations?branch=${encodeURIComponent(branch)}`,
      { method: 'GET' },
      token,
    );
  },

  createOperation(
    token: string,
    payload: {
      type:
        | 'INGRESO_EXTRAORDINARIO'
        | 'EGRESO_EXTRAORDINARIO'
        | 'TRANSFERENCIA_CAJAS'
        | 'GASTO';
      amount: number;
      category?: string;
      detail: string;
      branch?: string;
    },
  ): Promise<CashOperationRecord> {
    return request<CashOperationRecord>(
      '/treasury/operations',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      token,
    );
  },
};
