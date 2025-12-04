import { useState, useEffect } from 'react';
import adminService from '../services/adminService';
import authService from '../services/authService';

/**
 * Hook para obtener la configuración del sistema
 * Incluye el logo y nombre del sistema
 */
export const useSystemConfig = () => {
  const [config, setConfig] = useState({
    nombreSistema: 'Aprende Jugando',
    logoUrl: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    const cargarConfiguracion = async () => {
      // Solo intentar cargar configuración si el usuario es admin
      const usuario = authService.getCurrentUser();

      if (usuario?.rol !== 'admin') {
        // Para usuarios no admin, usar valores por defecto
        setConfig({
          nombreSistema: 'Aprende Jugando',
          logoUrl: null,
          loading: false,
          error: null
        });
        return;
      }

      try {
        const response = await adminService.getConfiguracion();
        if (response.success) {
          setConfig({
            nombreSistema: response.data.nombreSistema || 'Aprende Jugando',
            logoUrl: response.data.logoUrl || null,
            loading: false,
            error: null
          });
        }
      } catch (error) {
        // Si hay error, usar valores por defecto
        setConfig({
          nombreSistema: 'Aprende Jugando',
          logoUrl: null,
          loading: false,
          error: null
        });
      }
    };

    cargarConfiguracion();
  }, []);

  return config;
};

export default useSystemConfig;
