import React from 'react';
import { ActiveScreen, TesoreriaTab, UserProfile } from '../../types/domain.types';
import { BiDashboardView } from '../bi/BiDashboardView';

interface AdminDashboardViewProps {
  token: string;
  user: UserProfile;
  onNavigate: (screen: ActiveScreen, tab?: TesoreriaTab) => void;
}

/**
 * AdminDashboardView — Fachada que conecta al rol ADMINISTRADOR
 * con el Dashboard de Inteligencia de Negocios (BI) y Supervisión de Cajas en Vivo.
 */
export const AdminDashboardView: React.FC<AdminDashboardViewProps> = (props) => {
  return <BiDashboardView {...props} />;
};
