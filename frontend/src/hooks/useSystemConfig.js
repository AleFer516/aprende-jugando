import { useState, useEffect } from 'react';
import adminService from '../services/adminService';

/**
 * Hook para obtener la configuración del sistema
 * Incluye el logo y nombre del sistema
 */
export const useSystemConfig = () => {
  const [config, setConfig] = useState({
    nombreSistema: 'Luminia',
    logoUrl: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    const cargarConfiguracion = async () => {
      try {
        const response = await adminService.getConfiguracion();
        if (response.success) {
          setConfig({
            nombreSistema: response.data.nombreSistema || 'Luminia',
            logoUrl: response.data.logoUrl || null,
            loading: false,
            error: null
          });
        }
      } catch (error) {
        // Si hay error (por ejemplo, sin permisos), usar valores por defecto
        setConfig({
          nombreSistema: 'Luminia',
          logoUrl: null,
          loading: false,
          error: error.message
        });
      }
    };

    cargarConfiguracion();
  }, []);

  return config;
};

export default useSystemConfig;
