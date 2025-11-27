// src/pages/admin/AdminActividad.jsx
// Página "Actividad" del panel admin.

import { useMemo, useState } from "react";
import "../../styles/adminActividad.css";

function AdminActividad() {
  const [filtroFecha, setFiltroFecha] = useState("todas");
  const [busqueda, setBusqueda] = useState("");

  // Actividades de ejemplo
  const actividades = [
    {
      id: 1,
      descripcion: "Alejandro creó un nuevo usuario",
      fecha: "31/08/2025",
      tipo: "usuario",
    },
    {
      id: 2,
      descripcion: "Camila subió al nivel 6",
      fecha: "15/07/2025",
      tipo: "progreso",
    },
    {
      id: 3,
      descripcion: "María editó su perfil",
      fecha: "10/09/2025",
      tipo: "perfil",
    },
    {
      id: 4,
      descripcion: "Se creó la misión 'Álgebra básica'",
      fecha: "02/09/2025",
      tipo: "mision",
    },
  ];

  // Filtro básico (solo por texto, el filtro de fecha es decorativo por ahora)
  const actividadesFiltradas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return actividades.filter((act) => {
      const coincideTexto =
        !texto || act.descripcion.toLowerCase().includes(texto);

      // Podrías reemplazar esto por lógica real de fecha más adelante
      const coincideFecha = filtroFecha === "todas";

      return coincideTexto && coincideFecha;
    });
  }, [actividades, busqueda, filtroFecha]);

  const getIconoActividad = (tipo) => {
    switch (tipo) {
      case "usuario":
        return (
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 10a3 3 0 100-6 3 3 0 000 6z" />
            <path
              fillRule="evenodd"
              d="M4 16a6 6 0 1112 0H4z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "progreso":
        return (
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path d="M3 3a1 1 0 000 2h1v11a1 1 0 102 0V5h2v7a1 1 0 102 0V5h2v4a1 1 0 102 0V5h1a1 1 0 100-2H3z" />
          </svg>
        );
      case "perfil":
        return (
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 2a4 4 0 00-2 7.516V11H6a2 2 0 00-2 2v3a1 1 0 102 0v-3h2v3a1 1 0 102 0v-3h2v3a1 1 0 102 0v-3a2 2 0 00-2-2h-2V9.516A4 4 0 0010 2z" />
          </svg>
        );
      case "mision":
        return (
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path d="M4 3a2 2 0 012-2h6a2 2 0 012 2v1h1a1 1 0 01.8 1.6l-7 9a1 1 0 01-1.6 0l-3-4A1 1 0 015.2 9.4L8 12.5 13.25 5H14V3a1 1 0 00-1-1H6a1 1 0 00-1 1v2H4V3z" />
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
        {actividadesFiltradas.length === 0 ? (
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
                    {act.descripcion}
                  </p>
                </div>

                <div className="admin-actividad-fecha">
                  <span>{act.fecha}</span>
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
