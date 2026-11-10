import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import { PublicApi } from '../services/api';
import { PublicBrandingInfo } from '../types/domain.types';

export const DEFAULT_BRANDING: PublicBrandingInfo = {
  companyId: 'default',
  companyName: 'UltraTech Carreras',
  legalName: 'UltraTech Sports Nutrition S.A.',
  cuit: '30-71234567-9',
  slogan: 'ADVANCED TECHNOLOGY IN SPORTS NUTRITION',
  logoUrl: '/ultratech-carreras-logo.svg',
  bannerUrl: '/ultratech-carreras-banner.svg',
  primaryColor: '#D4AF37',
  customSvg: null,
  status: 'ACTIVE',
};

interface BrandingContextValue {
  branding: PublicBrandingInfo;
  loading: boolean;
  setBranding: React.Dispatch<React.SetStateAction<PublicBrandingInfo>>;
  reloadBranding: () => Promise<void>;
}

const BrandingContext = createContext<BrandingContextValue>({
  branding: DEFAULT_BRANDING,
  loading: false,
  setBranding: () => {},
  reloadBranding: async () => {},
});

export const BrandingProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [branding, setBranding] = useState<PublicBrandingInfo>(() => {
    try {
      const cached = localStorage.getItem('justi_branding_cache');
      if (cached) {
        return { ...DEFAULT_BRANDING, ...JSON.parse(cached) };
      }
    } catch {}
    return DEFAULT_BRANDING;
  });
  const [loading, setLoading] = useState(false);

  const reloadBranding = useCallback(async () => {
    try {
      setLoading(true);
      const data = await PublicApi.getBranding();
      if (data && data.companyName) {
        setBranding(data);
        try {
          localStorage.setItem('justi_branding_cache', JSON.stringify(data));
        } catch {}
      }
    } catch {
      // Usar branding por defecto en caso de fallo de red
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reloadBranding();
  }, [reloadBranding]);

  // Actualizar el título de la pestaña del navegador dinámicamente
  useEffect(() => {
    if (branding.companyName) {
      document.title = `${branding.companyName} — Sistema de Gestión POS`;
    }
  }, [branding.companyName]);

  return (
    <BrandingContext.Provider
      value={{
        branding,
        loading,
        setBranding,
        reloadBranding,
      }}
    >
      {children}
    </BrandingContext.Provider>
  );
};

export const useBranding = () => useContext(BrandingContext);
