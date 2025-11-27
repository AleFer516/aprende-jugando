// src/pages/admin/AdminEstadisticas.jsx
// Página de estadísticas globales del panel admin.

import { useState } from "react";
import "../../styles/adminEstadisticas.css";

function AdminEstadisticas() {
  const statsTop = [
    { id: 1, label: "Total usuarios", value: 500, icon: "users" },
    { id: 2, label: "Total de estudiantes", value: 320, icon: "student" },
    { id: 3, label: "Total de GM", value: 180, icon: "gm" },
    { id: 4, label: "Total de misiones", value: 70, icon: "missions" },
    { id: 5, label: "Instituciones registradas", value: 19, icon: "institutions" },
  ];

  const categoriasMisiones = [
    { id: 1, label: "Mat.", value: 5, fullName: "Matemáticas" },
    { id: 2, label: "Ciencias.", value: 9, fullName: "Ciencias" },
    { id: 3, label: "Esp.", value: 7, fullName: "Español" },
    { id: 4, label: "Progra.", value: 10, fullName: "Programación" },
  ];

  const [cardHover, setCardHover] = useState(null);
  const [barHover, setBarHover] = useState(null);

  const getIcon = (type) => {
    switch (type) {
      case "users":
        return (
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
          </svg>
        );
      case "student":
        return (
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
          </svg>
        );
      case "gm":
        return (
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
            <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
          </svg>
        );
      case "missions":
        return (
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
          </svg>
        );
      case "institutions":
        return (
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="admin-estadisticas">
      {/* Título principal */}
      <h1 className="admin-estadisticas-title">Estadísticas</h1>

      {/* Tarjetas superiores */}
      <section className="admin-estadisticas-top-row">
        {statsTop.map((stat, index) => (
          <article
            key={stat.id}
            className={`admin-estadistica-card ${cardHover === stat.id ? "hovered" : ""}`}
            style={{ animationDelay: `${index * 0.07}s` }}
            onMouseEnter={() => setCardHover(stat.id)}
            onMouseLeave={() => setCardHover(null)}
          >
            <div className="admin-estadistica-icon">
              {getIcon(stat.icon)}
            </div>
            <h2>{stat.label}</h2>
            <p className="admin-estadistica-value">{stat.value}</p>
          </article>
        ))}
      </section>

      {/* Fila media: roles + misiones por categoría */}
      <section className="admin-estadisticas-middle-row">
        {/* Distribución de roles */}
        <article className="admin-estadisticas-panel admin-roles-panel">
          <header className="admin-estadisticas-panel-header">
            <span>Distribución de roles</span>
            <div className="admin-panel-pulse"></div>
          </header>

          <div className="admin-roles-content">
            <div className="admin-roles-chart-wrapper">
              <div className="admin-roles-chart-circle">
                <div className="admin-roles-chart-inner">
                  <div className="admin-roles-chart-center">
                    <span className="admin-roles-total">500</span>
                    <span className="admin-roles-label">Total</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="admin-roles-legend">
              <div className="admin-roles-legend-item">
                <span className="legend-dot legend-dot-gm" />
                <div>
                  <p className="legend-label">GM</p>
                  <p className="legend-value">180 usuarios (36%)</p>
                </div>
              </div>
              <div className="admin-roles-legend-item">
                <span className="legend-dot legend-dot-estudiantes" />
                <div>
                  <p className="legend-label">Estudiantes</p>
                  <p className="legend-value">320 usuarios (64%)</p>
                </div>
              </div>
            </div>
          </div>
        </article>

        {/* Misiones completadas por categoría */}
        <article className="admin-estadisticas-panel admin-misiones-panel">
          <header className="admin-estadisticas-panel-header">
            <span>Misiones completadas por categoría</span>
            <span className="admin-panel-total">Total: 31</span>
          </header>

          <div className="admin-misiones-chart">
            {categoriasMisiones.map((cat, index) => (
              <div
                key={cat.id}
                className="admin-misiones-bar-wrapper"
                onMouseEnter={() => setBarHover(cat.id)}
                onMouseLeave={() => setBarHover(null)}
              >
                <div
                  className={`admin-misiones-bar ${barHover === cat.id ? "hovered" : ""}`}
                  style={{
                    height: `${(cat.value / 10) * 100}%`,
                    animationDelay: `${index * 0.08 + 0.1}s`,
                  }}
                >
                  {barHover === cat.id && (
                    <span className="admin-misiones-tooltip">
                      {cat.fullName}: {cat.value}
                    </span>
                  )}
                </div>
                <span className="admin-misiones-bar-label">{cat.label}</span>
                <span className="admin-misiones-bar-value">{cat.value}</span>
              </div>
            ))}
          </div>
        </article>
      </section>

      {/* Fila inferior: actividad semanal y mensual */}
      <section className="admin-estadisticas-bottom-row">
        {/* Actividad por semana */}
        <article className="admin-estadisticas-panel admin-actividad-panel">
          <header className="admin-estadisticas-panel-header">
            <span>Actividad por semana</span>
            <span className="admin-panel-badge">Última semana</span>
          </header>

          <div className="admin-actividad-chart">
            <svg
              viewBox="0 0 100 50"
              preserveAspectRatio="none"
              className="admin-line-chart-svg"
            >
              <defs>
                <linearGradient id="lineGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" style={{ stopColor: "#00a7d5", stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: "#228be6", stopOpacity: 1 }} />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <polyline
                className="admin-line-chart-path"
                points="0,35 10,40 20,30 30,32 40,28 50,18 60,26 70,20 80,16 90,18 100,15"
                style={{ stroke: "url(#lineGradient1)" }}
              />
              <circle className="admin-chart-dot" cx="0" cy="35" r="2" />
              <circle className="admin-chart-dot" cx="10" cy="40" r="2" />
              <circle className="admin-chart-dot" cx="20" cy="30" r="2" />
              <circle className="admin-chart-dot" cx="30" cy="32" r="2" />
              <circle className="admin-chart-dot" cx="40" cy="28" r="2" />
              <circle className="admin-chart-dot" cx="50" cy="18" r="2" />
              <circle className="admin-chart-dot" cx="60" cy="26" r="2" />
              <circle className="admin-chart-dot" cx="70" cy="20" r="2" />
              <circle className="admin-chart-dot" cx="80" cy="16" r="2" />
              <circle className="admin-chart-dot" cx="90" cy="18" r="2" />
              <circle className="admin-chart-dot" cx="100" cy="15" r="2" />
            </svg>
            <div className="admin-actividad-xlabels">
              <span>Dom</span>
              <span>Lun</span>
              <span>Mar</span>
              <span>Mié</span>
              <span>Jue</span>
              <span>Vie</span>
              <span>Sáb</span>
            </div>
          </div>
        </article>

        {/* Actividad por mes */}
        <article className="admin-estadisticas-panel admin-actividad-panel">
          <header className="admin-estadisticas-panel-header">
            <span>Actividad por mes</span>
            <span className="admin-panel-badge">Últimos 4 meses</span>
          </header>

          <div className="admin-actividad-chart">
            <svg
              viewBox="0 0 100 50"
              preserveAspectRatio="none"
              className="admin-line-chart-svg"
            >
              <defs>
                <linearGradient id="lineGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" style={{ stopColor: "#22c55e", stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: "#10b981", stopOpacity: 1 }} />
                </linearGradient>
              </defs>
              <polyline
                className="admin-line-chart-path admin-line-chart-path-2"
                points="0,38 33,30 66,18 100,17"
                style={{ stroke: "url(#lineGradient2)" }}
              />
              <circle className="admin-chart-dot admin-chart-dot-green" cx="0" cy="38" r="2" />
              <circle className="admin-chart-dot admin-chart-dot-green" cx="33" cy="30" r="2" />
              <circle className="admin-chart-dot admin-chart-dot-green" cx="66" cy="18" r="2" />
              <circle className="admin-chart-dot admin-chart-dot-green" cx="100" cy="17" r="2" />
            </svg>
            <div className="admin-actividad-xlabels">
              <span>Sep</span>
              <span>Oct</span>
              <span>Nov</span>
              <span>Dic</span>
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}

export default AdminEstadisticas;