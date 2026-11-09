import React, { useState, useEffect, useCallback } from 'react';
import {
  ActiveScreen,
  CashOperationRecord,
  CashRegisterRecord,
  CategoryItem,
  CustomerItem,
  LoginResponse,
  ProductItem,
  TesoreriaTab,
} from './types/domain.types';
import { CatalogApi, TreasuryApi } from './services/api.service';
import { JustiTopbar } from './components/JustiTopbar';
import { LoginView } from './modules/auth/LoginView';
import { HomeView } from './modules/home/HomeView';
import { AdminDashboardView } from './modules/home/AdminDashboardView';
import { ClientesView } from './modules/crm/ClientesView';
import { NuevaVentaView } from './modules/pos/NuevaVentaView';
import { VentasPorUsuarioView } from './modules/pos/VentasPorUsuarioView';
import { TesoreriaView } from './modules/treasury/TesoreriaView';
import { MasterControlView } from './modules/master/MasterControlView';
import { UsuariosView } from './modules/users/UsuariosView';
import { ProductosView } from './modules/products/ProductosView';
import { useTheme } from './hooks/useTheme';
import { useAuthSession } from './hooks/useAuthSession';

const CATALOG_CACHE_KEY = 'justi_pos_catalog_cache_v1';
const REGISTERS_STORAGE_KEY = 'justi_pos_registers_v1';

export const App: React.FC = () => {
  const { isDark, toggleDarkMode } = useTheme();
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>('BIENVENIDO');
  const { session, handleLoginSuccess, handleLogout } =
    useAuthSession(setActiveScreen);

  const [tesoreriaTab, setTesoreriaTab] = useState<TesoreriaTab>('CAJAS');
  const [consumidorFinalMode, setConsumidorFinalMode] =
    useState<boolean>(false);
  const [selectedCustomerForSale, setSelectedCustomerForSale] =
    useState<CustomerItem | null>(null);

  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [products, setProducts] = useState<ProductItem[]>(() => {
    try {
      const cached = localStorage.getItem(CATALOG_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        return parsed.products || [];
      }
    } catch {
      // ignore
    }
    return [];
  });

  // Estado de Cajas de Tesorería (Por defecto iniciamos con una Caja "Ventas Sucursal" abierta en PASTEUR)
  const [registers, setRegisters] = useState<CashRegisterRecord[]>(() => {
    try {
      const saved = localStorage.getItem(REGISTERS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [
      {
        id: 'caja-locales-01',
        userFullName: 'Gregory Rodriguez',
        branch: 'LOCALES',
        boxType: 'Ventas Sucursal',
        openedAt: new Date().toLocaleString('es-AR'),
        closedAt: null,
        status: 'ABIERTA',
        initialBalance: 0,
        currentBalance: 0,
        observations: 'Apertura inicial turno LOCALES',
      },
    ];
  });

  const [operations, setOperations] = useState<CashOperationRecord[]>([]);

  useEffect(() => {
    try {
      localStorage.setItem(REGISTERS_STORAGE_KEY, JSON.stringify(registers));
    } catch {
      // ignore
    }
  }, [registers]);

  const syncCatalog = useCallback(async (token: string) => {
    try {
      const delta = await CatalogApi.syncDelta(token);
      setCategories(delta.categories);
      setProducts(delta.products);
      localStorage.setItem(
        CATALOG_CACHE_KEY,
        JSON.stringify({
          categories: delta.categories,
          products: delta.products,
          syncedAt: delta.serverTimestamp,
        }),
      );
    } catch {
      // Si está offline, conserva el catálogo cacheado en localStorage
    }
  }, []);

  const userBranch = session?.user.branch || 'LOCALES';

  const syncTreasury = useCallback(
    async (token: string) => {
      try {
        const [remoteRegisters, remoteOps] = await Promise.all([
          TreasuryApi.listRegisters(token, userBranch),
          TreasuryApi.listOperations(token, userBranch),
        ]);
        if (remoteRegisters.length > 0) {
          setRegisters(remoteRegisters);
        } else {
          setRegisters([]);
        }
        setOperations(remoteOps);
      } catch {
        // Si está offline, conserva el estado de caja cacheado en localStorage
      }
    },
    [userBranch],
  );

  useEffect(() => {
    if (session?.accessToken && session.user.role !== 'CRM') {
      syncCatalog(session.accessToken);
      syncTreasury(session.accessToken);
    }
  }, [session?.accessToken, session?.user.role, syncCatalog, syncTreasury]);

  const handleNavigate = (
    screen: ActiveScreen,
    tab?: TesoreriaTab,
    consumidorFinal?: boolean,
  ) => {
    if (
      session?.user.role === 'CRM' &&
      (screen === 'NUEVA_VENTA' || screen === 'APERTURA_CAJA')
    ) {
      setActiveScreen('CLIENTES');
      return;
    }
    if (session?.user.role === 'ADMIN' && screen === 'NUEVA_VENTA') {
      setActiveScreen('BIENVENIDO');
      return;
    }
    setActiveScreen(screen);
    if (tab) {
      setTesoreriaTab(tab);
    }
    if (typeof consumidorFinal === 'boolean') {
      setConsumidorFinalMode(consumidorFinal);
      if (consumidorFinal) {
        setSelectedCustomerForSale(null);
      }
    }
  };

  const isVentasSucursalOpen = registers.some(
    (r) => r.status === 'ABIERTA' && r.boxType === 'Ventas Sucursal',
  );

  const handleOpenRegister = async (
    boxType: 'Ventas Sucursal' | 'Caja Consolidada',
    observations: string,
  ) => {
    if (session?.accessToken) {
      try {
        const created = await TreasuryApi.openRegister(session.accessToken, {
          boxType,
          branch: userBranch,
          observations,
        });
        setRegisters((prev) => [created, ...prev]);
        return;
      } catch {
        // Fallback local si el backend está offline
      }
    }
    const newReg: CashRegisterRecord = {
      id: `caja-${Date.now()}`,
      userFullName: session?.user.fullName || 'Gregory Rodriguez',
      branch: userBranch,
      boxType,
      openedAt: new Date().toLocaleString('es-AR'),
      closedAt: null,
      status: 'ABIERTA',
      initialBalance: 0,
      currentBalance: 0,
      observations,
    };
    setRegisters((prev) => [newReg, ...prev]);
  };

  const handleCloseRegister = async (id: string) => {
    if (session?.accessToken) {
      try {
        const closed = await TreasuryApi.closeRegister(session.accessToken, id);
        setRegisters((prev) => prev.map((r) => (r.id === id ? closed : r)));
        return;
      } catch {
        // Fallback local si el backend está offline
      }
    }
    setRegisters((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: 'CERRADA',
              closedAt: new Date().toLocaleString('es-AR'),
            }
          : r,
      ),
    );
  };

  const handleRegisterOperation = async (
    op: Omit<CashOperationRecord, 'id' | 'createdAt'>,
  ) => {
    if (session?.accessToken) {
      try {
        const createdOp = await TreasuryApi.createOperation(
          session.accessToken,
          op,
        );
        setOperations((prev) => [createdOp, ...prev]);
        await syncTreasury(session.accessToken);
        return;
      } catch {
        // Fallback local si el backend está offline
      }
    }
    const record: CashOperationRecord = {
      ...op,
      id: `op-${Date.now()}`,
      createdAt: new Date().toLocaleString('es-AR'),
    };
    setOperations((prev) => [record, ...prev]);

    setRegisters((prev) =>
      prev.map((r) => {
        if (r.status !== 'ABIERTA') return r;
        const delta =
          op.type === 'INGRESO_EXTRAORDINARIO' ? op.amount : -op.amount;
        return {
          ...r,
          currentBalance: Number((r.currentBalance + delta).toFixed(2)),
        };
      }),
    );
  };

  const handleSaleCompleted = (amountPesos: number) => {
    setRegisters((prev) =>
      prev.map((r) =>
        r.status === 'ABIERTA' && r.boxType === 'Ventas Sucursal'
          ? {
              ...r,
              currentBalance: Number(
                (r.currentBalance + amountPesos).toFixed(2),
              ),
            }
          : r,
      ),
    );
  };

  if (!session) {
    return (
      <LoginView
        onLoginSuccess={handleLoginSuccess}
        isDark={isDark}
        onToggleDarkMode={toggleDarkMode}
      />
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#E8F2FC]">
      <JustiTopbar
        user={session.user}
        activeScreen={activeScreen}
        tesoreriaTab={tesoreriaTab}
        isCajaOpen={isVentasSucursalOpen}
        isDark={isDark}
        onToggleDarkMode={toggleDarkMode}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      />

      <main className="flex-1">
        {activeScreen === 'BIENVENIDO' && (
          session.user.role === 'ADMIN' ? (
            <AdminDashboardView
              token={session.accessToken}
              user={session.user}
              onNavigate={handleNavigate}
            />
          ) : (
            <HomeView user={session.user} onNavigate={handleNavigate} />
          )
        )}

        {activeScreen === 'CLIENTES' && (
          <ClientesView
            token={session.accessToken}
            canSell={
              session.user.role === 'CASHIER' || session.user.role === 'MASTER'
            }
            userBranch={userBranch}
            isBranchLocked={
              session.user.role !== 'ADMIN' && session.user.role !== 'MASTER'
            }
            onSelectCustomerForSale={(customer) => {
              if (
                session.user.role !== 'CASHIER' &&
                session.user.role !== 'MASTER'
              ) {
                return;
              }
              setSelectedCustomerForSale(customer);
              setConsumidorFinalMode(false);
              setActiveScreen('NUEVA_VENTA');
            }}
          />
        )}

        {activeScreen === 'VENTAS_USUARIOS' &&
          session.user.role !== 'CRM' && (
            <VentasPorUsuarioView
              token={session.accessToken}
              user={session.user}
            />
          )}

        {activeScreen === 'USUARIOS' &&
          (session.user.role === 'ADMIN' || session.user.role === 'MASTER') && (
            <UsuariosView
              token={session.accessToken}
              currentUserRole={session.user.role}
            />
          )}

        {activeScreen === 'PRODUCTOS' &&
          (session.user.role === 'ADMIN' || session.user.role === 'MASTER') && (
            <ProductosView
              token={session.accessToken}
              onProductUpdated={() => syncCatalog(session.accessToken)}
            />
          )}

        {activeScreen === 'NUEVA_VENTA' &&
          (session.user.role === 'CASHIER' ||
            session.user.role === 'MASTER') && (
          <NuevaVentaView
            token={session.accessToken}
            user={session.user}
            products={products}
            categories={categories}
            preselectedCustomer={selectedCustomerForSale}
            consumidorFinalMode={consumidorFinalMode}
            isCajaOpen={isVentasSucursalOpen}
            onOpenCajaQuick={() => {
              handleOpenRegister(
                'Ventas Sucursal',
                'Apertura rápida desde POS Nueva Venta',
              );
            }}
            onGoToClientes={() => setActiveScreen('CLIENTES')}
            onSaleCompleted={handleSaleCompleted}
          />
        )}

        {activeScreen === 'APERTURA_CAJA' && session.user.role !== 'CRM' && (
          <TesoreriaView
            user={session.user}
            activeTab={tesoreriaTab}
            onChangeTab={setTesoreriaTab}
            registers={registers}
            operations={operations}
            onOpenRegister={handleOpenRegister}
            onCloseRegister={handleCloseRegister}
            onRegisterOperation={handleRegisterOperation}
          />
        )}

        {activeScreen === 'MASTER_CONTROL' &&
          session.user.role === 'MASTER' && (
            <MasterControlView token={session.accessToken} />
          )}
      </main>
    </div>
  );
};
