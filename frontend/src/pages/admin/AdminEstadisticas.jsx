// src/pages/admin/AdminEstadisticas.jsx
// Página de estadísticas globales del panel admin.

import { useState, useEffect } from "react";
import "../../styles/adminEstadisticas.css";
import adminService from "../../services/adminService";

function AdminEstadisticas() {
  const [estadisticas, setEstadisticas] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [cardHover, setCardHover] = useState(null);

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    try {
      setCargando(true);
      setError(null);
      const response = await adminService.getEstadisticasGlobales();

      if (response.success) {
        setEstadisticas(response.data);
      } else {
        setError(response.message || 'Error al cargar estadísticas');
      }
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
      setError(error.response?.data?.message || 'Error al cargar estadísticas');
    } finally {
      setCargando(false);
    }
  };

  // Datos por defecto mientras carga
  const statsTop = estadisticas ? [
    { id: 1, label: "Total usuarios", value: estadisticas.totalUsuarios, icon: "users" },
    { id: 2, label: "Total de estudiantes", value: estadisticas.totalEstudiantes, icon: "student" },
    { id: 3, label: "Total de GM", value: estadisticas.totalGMs, icon: "gm" },
    { id: 4, label: "Total de misiones", value: estadisticas.totalMisiones, icon: "missions" },
    { id: 5, label: "Instituciones registradas", value: estadisticas.totalInstituciones, icon: "institutions" },
  ] : [];

  const categoriasMisiones = estadisticas?.misionesPorCategoria || [];

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

  if (cargando) {
    return (
      <div className="admin-estadisticas">
        <h1 className="admin-estadisticas-title">Estadísticas</h1>
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6b7280' }}>
          <p>Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-estadisticas">
        <h1 className="admin-estadisticas-title">Estadísticas</h1>
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#ef4444' }}>
          <p>Error: {error}</p>
          <button
            onClick={cargarEstadisticas}
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
      </div>
    );
  }

  if (!estadisticas) {
    return null;
  }

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
            {/* Gráfico circular mejorado */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem 0' }}>
              <svg width="200" height="200" viewBox="0 0 200 200">
                <defs>
                  <linearGradient id="gradientGM" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#22c55e', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: '#10b981', stopOpacity: 1 }} />
                  </linearGradient>
                  <linearGradient id="gradientEstudiantes" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: '#2563eb', stopOpacity: 1 }} />
                  </linearGradient>
                </defs>

                {/* Círculo de fondo */}
                <circle cx="100" cy="100" r="70" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="25" />

                {/* Segmento de GM */}
                <circle
                  cx="100"
                  cy="100"
                  r="70"
                  fill="none"
                  stroke="url(#gradientGM)"
                  strokeWidth="25"
                  strokeDasharray={`${(estadisticas.distribucionRoles.porcentajeGM / 100) * 440} 440`}
                  strokeDashoffset="0"
                  transform="rotate(-90 100 100)"
                  style={{ transition: 'stroke-dasharray 1s ease' }}
                />

                {/* Segmento de Estudiantes */}
                <circle
                  cx="100"
                  cy="100"
                  r="70"
                  fill="none"
                  stroke="url(#gradientEstudiantes)"
                  strokeWidth="25"
                  strokeDasharray={`${(estadisticas.distribucionRoles.porcentajeEstudiante / 100) * 440} 440`}
                  strokeDashoffset={`${-(estadisticas.distribucionRoles.porcentajeGM / 100) * 440}`}
                  transform="rotate(-90 100 100)"
                  style={{ transition: 'stroke-dasharray 1s ease' }}
                />

                {/* Texto central */}
                <text x="100" y="95" textAnchor="middle" fill="#ffffff" fontSize="36" fontWeight="bold">
                  {estadisticas.totalUsuarios}
                </text>
                <text x="100" y="115" textAnchor="middle" fill="#9ca3af" fontSize="14">
                  Total
                </text>
              </svg>
            </div>

            {/* Leyenda mejorada */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '4px',
                  background: 'linear-gradient(135deg, #22c55e, #10b981)'
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: '0.25rem' }}>GM</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#ffffff' }}>
                    {estadisticas.distribucionRoles.gm} usuarios
                    <span style={{ fontSize: '0.85rem', color: '#22c55e', marginLeft: '0.5rem' }}>
                      ({estadisticas.distribucionRoles.porcentajeGM}%)
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '4px',
                  background: 'linear-gradient(135deg, #3b82f6, #2563eb)'
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: '0.25rem' }}>Estudiantes</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#ffffff' }}>
                    {estadisticas.distribucionRoles.estudiante} usuarios
                    <span style={{ fontSize: '0.85rem', color: '#3b82f6', marginLeft: '0.5rem' }}>
                      ({estadisticas.distribucionRoles.porcentajeEstudiante}%)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </article>

        {/* Misiones por categoría */}
        <article className="admin-estadisticas-panel admin-misiones-panel">
          <header className="admin-estadisticas-panel-header">
            <span>Misiones completadas por categoría</span>
          </header>

          <div className="admin-misiones-chart" style={{ padding: '2.5rem 1.5rem 1.5rem', position: 'relative' }}>
            {categoriasMisiones.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
                No hay misiones registradas
              </div>
            ) : (
              <div style={{
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-around',
                height: '200px',
                gap: '1.5rem',
                position: 'relative',
                paddingLeft: '35px',
                paddingRight: '10px'
              }}>
                {/* Líneas de referencia del eje Y */}
                {[0, 2, 4, 6, 8, 10].map((line, i) => (
                  <div key={i} style={{
                    position: 'absolute',
                    left: '35px',
                    right: '10px',
                    bottom: `${(line / 10) * 100}%`,
                    height: '1px',
                    background: i === 0 ? 'rgba(100, 150, 255, 0.3)' : 'rgba(100, 150, 255, 0.1)',
                    zIndex: 0
                  }}>
                    <span style={{
                      position: 'absolute',
                      left: '-30px',
                      top: '-10px',
                      fontSize: '0.75rem',
                      color: '#8b9dc3',
                      fontWeight: '400'
                    }}>
                      {line}
                    </span>
                  </div>
                ))}

                {/* Barras de categorías */}
                {categoriasMisiones.map((cat, index) => {
                  const maxVal = Math.max(...categoriasMisiones.map(c => c.total), 1);
                  const altura = (cat.total / maxVal) * 100;
                  const colores = ['#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899'];
                  const color = colores[index % colores.length];

                  return (
                    <div key={index} style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.5rem',
                      flex: 1,
                      maxWidth: '70px',
                      position: 'relative',
                      zIndex: 1
                    }}>
                      {/* Valor sobre la barra */}
                      <div style={{
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        color: '#ffffff',
                        marginBottom: '0.25rem',
                        opacity: altura > 0 ? 1 : 0
                      }}>
                        {cat.total}
                      </div>

                      {/* Barra */}
                      <div
                        style={{
                          width: '100%',
                          height: `${altura}%`,
                          minHeight: altura > 0 ? '10px' : '0',
                          background: `linear-gradient(180deg, ${color}, ${color}cc)`,
                          borderRadius: '6px 6px 0 0',
                          position: 'relative',
                          boxShadow: `0 0 15px ${color}30`,
                          transition: 'all 0.3s ease',
                          cursor: 'pointer',
                          animation: `barGrowVertical 0.8s ease ${index * 0.1}s backwards`,
                          transformOrigin: 'bottom'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.filter = 'brightness(1.3)';
                          e.currentTarget.style.boxShadow = `0 0 25px ${color}60`;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.filter = 'brightness(1)';
                          e.currentTarget.style.boxShadow = `0 0 15px ${color}30`;
                        }}
                      />

                      {/* Etiqueta de categoría */}
                      <div style={{
                        fontSize: '0.7rem',
                        color: '#9ca3af',
                        textAlign: 'center',
                        textTransform: 'capitalize',
                        maxWidth: '70px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        fontWeight: '500'
                      }} title={cat.categoria}>
                        {cat.categoria.length > 6 ? cat.categoria.substring(0, 6) + '.' : cat.categoria}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
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
            {!estadisticas.actividadSemanal || estadisticas.actividadSemanal.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
                No hay datos de actividad semanal
              </div>
            ) : (
              <>
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
                  </defs>
                  <polyline
                    className="admin-line-chart-path"
                    points={estadisticas.actividadSemanal
                      .map((dia, i) => {
                        const x = estadisticas.actividadSemanal.length > 1
                          ? (i / (estadisticas.actividadSemanal.length - 1)) * 100
                          : 50;
                        const maxActividad = Math.max(...estadisticas.actividadSemanal.map(d => d.total), 1);
                        const y = 45 - ((dia.total / maxActividad) * 35);
                        return `${x},${y}`;
                      })
                      .join(' ')}
                    style={{ stroke: "url(#lineGradient1)" }}
                  />
                  {estadisticas.actividadSemanal.map((dia, i) => {
                    const x = estadisticas.actividadSemanal.length > 1
                      ? (i / (estadisticas.actividadSemanal.length - 1)) * 100
                      : 50;
                    const maxActividad = Math.max(...estadisticas.actividadSemanal.map(d => d.total), 1);
                    const y = 45 - ((dia.total / maxActividad) * 35);
                    return (
                      <circle
                        key={i}
                        className="admin-chart-dot"
                        cx={x}
                        cy={y}
                        r="2"
                      />
                    );
                  })}
                </svg>
                <div className="admin-actividad-xlabels">
                  {estadisticas.actividadSemanal.map((dia, i) => (
                    <span key={i}>{dia.dia}</span>
                  ))}
                </div>
              </>
            )}
          </div>
        </article>

        {/* Actividad mensual */}
        <article className="admin-estadisticas-panel admin-actividad-panel">
          <header className="admin-estadisticas-panel-header">
            <span>Actividad mensual</span>
            <span className="admin-panel-badge">Últimos 6 meses</span>
          </header>

          <div className="admin-actividad-chart">
            {estadisticas.actividadMensual.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
                No hay datos de actividad
              </div>
            ) : (
              <>
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
                    points={estadisticas.actividadMensual
                      .map((mes, i) => {
                        const x = estadisticas.actividadMensual.length > 1
                          ? (i / (estadisticas.actividadMensual.length - 1)) * 100
                          : 50;
                        const maxActividad = Math.max(...estadisticas.actividadMensual.map(m => m.total), 1);
                        const y = 45 - ((mes.total / maxActividad) * 35);
                        return `${x},${y}`;
                      })
                      .join(' ')}
                    style={{ stroke: "url(#lineGradient2)" }}
                  />
                  {estadisticas.actividadMensual.map((mes, i) => {
                    const x = estadisticas.actividadMensual.length > 1
                      ? (i / (estadisticas.actividadMensual.length - 1)) * 100
                      : 50;
                    const maxActividad = Math.max(...estadisticas.actividadMensual.map(m => m.total), 1);
                    const y = 45 - ((mes.total / maxActividad) * 35);
                    return (
                      <circle
                        key={i}
                        className="admin-chart-dot admin-chart-dot-green"
                        cx={x}
                        cy={y}
                        r="2"
                      />
                    );
                  })}
                </svg>
                <div className="admin-actividad-xlabels">
                  {estadisticas.actividadMensual.map((mes, i) => (
                    <span key={i}>{mes.mes}</span>
                  ))}
                </div>
              </>
            )}
          </div>
        </article>
      </section>
    </div>
  );
}

export default AdminEstadisticas;