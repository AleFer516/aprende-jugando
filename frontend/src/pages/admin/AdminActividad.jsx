// src/pages/admin/AdminActividad.jsx
// Página "Actividad" del panel admin.

import { useMemo, useState, useEffect } from "react";
import "../../styles/adminActividad.css";
import adminService from "../../services/adminService";

function AdminActividad() {
  const [filtroFecha, setFiltroFecha] = useState("todas");
  const [busqueda, setBusqueda] = useState("");
  const [actividades, setActividades] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarActividades();
  }, []);

  const cargarActividades = async () => {
    try {
      setCargando(true);
      setError(null);
      const response = await adminService.getRegistroActividad(100); // Obtener las últimas 100 actividades

      if (response.success) {
        // Usar los datos directamente del backend sin mapeo adicional
        setActividades(response.data);
      } else {
        setError(response.message || 'Error al cargar actividades');
      }
    } catch (error) {
      console.error('Error al cargar actividades:', error);
      setError(error.response?.data?.message || 'Error al cargar actividades');
    } finally {
      setCargando(false);
    }
  };

  // Filtro por texto y fecha
  const actividadesFiltradas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    const ahora = new Date();

    return actividades.filter((act) => {
      // Filtro por texto
      const coincideTexto = !texto ||
        act.titulo?.toLowerCase().includes(texto) ||
        act.usuario?.toLowerCase().includes(texto);

      // Filtro por fecha
      let coincideFecha = true;
      if (filtroFecha !== "todas" && act.fecha) {
        const fechaAct = new Date(act.fecha);

        switch (filtroFecha) {
          case "hoy": {
            const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
            coincideFecha = fechaAct >= hoy;
            break;
          }
          case "semana": {
            const inicioSemana = new Date(ahora);
            inicioSemana.setDate(ahora.getDate() - ahora.getDay());
            inicioSemana.setHours(0, 0, 0, 0);
            coincideFecha = fechaAct >= inicioSemana;
            break;
          }
          case "mes": {
            const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
            coincideFecha = fechaAct >= inicioMes;
            break;
          }
          default:
            coincideFecha = true;
        }
      }

      return coincideTexto && coincideFecha;
    });
  }, [actividades, busqueda, filtroFecha]);

  const getIconoActividad = (tipo) => {
    switch (tipo) {
      case "usuario":
        return (
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 10a3 3 0 100-6 3 3 0 000 6z" />
            <path fillRule="evenodd" d="M4 16a6 6 0 1112 0H4z" clipRule="evenodd" />
          </svg>
        );
      case "sistema":
        return (
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
          </svg>
        );
      case "configuracion":
        return (
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
          </svg>
        );
      case "auditoria":
        return (
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg viewBox="0 0 20 20" fill="currentColor">
            <circle cx="10" cy="10" r="4" />
          </svg>
        );
    }
  };

  // Formatear fecha y hora para mostrar
  const formatearFechaHora = (fecha, hora) => {
    const fechaObj = new Date(fecha);
    const dia = fechaObj.getDate().toString().padStart(2, '0');
    const mes = (fechaObj.getMonth() + 1).toString().padStart(2, '0');
    const año = fechaObj.getFullYear();
    const horaFormateada = hora ? hora.substring(0, 5) : '';
    return `${dia}/${mes}/${año} ${horaFormateada}`;
  };

  return (
    <div className="admin-actividad-page">
      {/* Título principal */}
      <h1 className="admin-actividad-title">Actividad</h1>

      {/* Barra de filtros */}
      <section className="admin-actividad-toolbar">
        <div className="admin-actividad-toolbar-left">
          <label className="admin-actividad-label">Fecha:</label>
          <div className="admin-actividad-select-wrapper">
            <select
              className="admin-actividad-select"
              value={filtroFecha}
              onChange={(e) => setFiltroFecha(e.target.value)}
            >
              <option value="todas">Todas</option>
              <option value="hoy">Hoy</option>
              <option value="semana">Esta semana</option>
              <option value="mes">Este mes</option>
            </select>
            <span className="admin-actividad-select-arrow">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 11.085l3.71-3.854a.75.75 0 111.08 1.04l-4.24 4.4a.75.75 0 01-1.08 0l-4.24-4.4a.75.75 0 01.02-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
          </div>
        </div>

        <div className="admin-actividad-search-wrapper">
          <input
            type="text"
            className="admin-actividad-search-input"
            placeholder="Buscar actividad"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <span className="admin-actividad-search-icon">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M12.9 14.32a6.5 6.5 0 111.414-1.414l3.39 3.39a1 1 0 01-1.414 1.415l-3.39-3.39zM13 8.5a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        </div>
      </section>

      {/* Lista de actividades */}
      <section className="admin-actividad-card">
        {cargando ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6b7280' }}>
            <p>Cargando actividades...</p>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#ef4444' }}>
            <p>Error: {error}</p>
            <button
              onClick={cargarActividades}
              style={{
                marginTop: '20px',
                padding: '10px 20px',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Reintentar
            </button>
          </div>
        ) : actividadesFiltradas.length === 0 ? (
          <p className="admin-actividad-empty">
            No se encontraron actividades para los filtros seleccionados.
          </p>
        ) : (
          <ul className="admin-actividad-list">
            {actividadesFiltradas.map((act, index) => (
              <li
                key={act.id}
                className="admin-actividad-item"
                style={{ animationDelay: `${index * 0.06}s` }}
              >
                <div className="admin-actividad-avatar">
                  {getIconoActividad(act.tipo)}
                </div>

                <div className="admin-actividad-info">
                  <p className="admin-actividad-descripcion">
                    {act.titulo}
                  </p>
                  {act.usuario && (
                    <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '4px' }}>
                      Por: {act.usuario}
                    </p>
                  )}
                </div>

                <div className="admin-actividad-fecha">
                  <span>{formatearFechaHora(act.fecha, act.hora)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default AdminActividad;
