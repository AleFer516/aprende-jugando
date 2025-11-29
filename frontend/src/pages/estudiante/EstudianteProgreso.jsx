// src/pages/estudiante/EstudianteProgreso.jsx
// Página de progreso del panel de estudiantes

import "../../styles/estudianteProgreso.css";

function EstudianteProgreso() {
  // Datos de ejemplo
  const estudiante = {
    nivel: 5,
    tituloNivel: "Explorador del saber",
    xpActual: 1250,
    xpSiguienteNivel: 1500,
  };

  const xpPercentage = Math.min(
    100,
    Math.round((estudiante.xpActual / estudiante.xpSiguienteNivel) * 100)
  );

  const estadoMisiones = {
    completadas: 6,
    enProgreso: 3,
    pendientes: 3,
  };

  const totalMisiones =
    estadoMisiones.completadas +
    estadoMisiones.enProgreso +
    estadoMisiones.pendientes;

  const metricas = {
    totalMisiones: totalMisiones,
    misionesCompletadas: estadoMisiones.completadas,
    tiempoEstudio: "8h",
  };

  const estadisticasAprendizaje = [
    { tema: "Fracciones", progreso: 85, color: "#00a7d5" },
    { tema: "Ecuaciones", progreso: 65, color: "#0891b2" },
    { tema: "Funciones", progreso: 45, color: "#06b6d4" },
  ];

  // Calcular porcentajes para el gráfico de dona
  const completadasPorcentaje = Math.round(
    (estadoMisiones.completadas / totalMisiones) * 100
  );
  const enProgresoPorcentaje = Math.round(
    (estadoMisiones.enProgreso / totalMisiones) * 100
  );
  const pendientesPorcentaje = Math.round(
    (estadoMisiones.pendientes / totalMisiones) * 100
  );

  return (
    <div className="estudiante-progreso">
      {/* Header */}
      <div className="progreso-header">
        <h1 className="progreso-title">Tu progreso</h1>
        <p className="progreso-subtitle">
          Visualiza tu avance y estadísticas de aprendizaje
        </p>
      </div>

      {/* Primera fila: XP + Estado de misiones */}
      <div className="progreso-top-grid">
        {/* Card de XP acumulada */}
        <div className="progreso-xp-card">
          <div className="progreso-card-header">
            <h2>XP acumulada</h2>
          </div>

          <div className="progreso-xp-content">
            <div className="progreso-nivel-circulo-wrapper">
              <div className="progreso-nivel-circulo">
                <div className="progreso-nivel-circulo-inner">
                  <span className="progreso-nivel-numero">
                    {estudiante.nivel}
                  </span>
                  <span className="progreso-nivel-label">NIVEL</span>
                </div>
                <svg className="progreso-nivel-svg" viewBox="0 0 200 200">
                  <circle
                    className="progreso-nivel-bg"
                    cx="100"
                    cy="100"
                    r="90"
                  />
                  <circle
                    className="progreso-nivel-progress"
                    cx="100"
                    cy="100"
                    r="90"
                    style={{
                      strokeDasharray: `${xpPercentage * 5.65} 565`,
                    }}
                  />
                </svg>
              </div>
            </div>

            <div className="progreso-xp-info">
              <h3 className="progreso-titulo-nivel">{estudiante.tituloNivel}</h3>
              <div className="progreso-xp-stats">
                <div className="progreso-xp-bar-wrapper">
                  <div className="progreso-xp-bar-bg">
                    <div
                      className="progreso-xp-bar-fill"
                      style={{ width: `${xpPercentage}%` }}
                    ></div>
                  </div>
                  <div className="progreso-xp-text">
                    <span className="progreso-xp-actual">
                      {estudiante.xpActual.toLocaleString()} XP
                    </span>
                    <span className="progreso-xp-siguiente">
                      / {estudiante.xpSiguienteNivel.toLocaleString()} XP
                    </span>
                  </div>
                </div>
                <p className="progreso-xp-mensaje">
                  Te faltan{" "}
                  <span className="progreso-xp-faltante">
                    {(
                      estudiante.xpSiguienteNivel - estudiante.xpActual
                    ).toLocaleString()}{" "}
                    XP
                  </span>{" "}
                  para subir al siguiente nivel
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Card de estado de misiones */}
        <div className="progreso-misiones-card">
          <div className="progreso-card-header">
            <h2>Estado de las misiones</h2>
          </div>

          <div className="progreso-misiones-content">
            <div className="progreso-dona-wrapper">
              <svg className="progreso-dona" viewBox="0 0 200 200">
                <circle
                  className="progreso-dona-segment completadas"
                  cx="100"
                  cy="100"
                  r="70"
                  style={{
                    strokeDasharray: `${completadasPorcentaje * 4.4} 440`,
                    strokeDashoffset: "0",
                  }}
                />
                <circle
                  className="progreso-dona-segment en-progreso"
                  cx="100"
                  cy="100"
                  r="70"
                  style={{
                    strokeDasharray: `${enProgresoPorcentaje * 4.4} 440`,
                    strokeDashoffset: `${-completadasPorcentaje * 4.4}`,
                  }}
                />
                <circle
                  className="progreso-dona-segment pendientes"
                  cx="100"
                  cy="100"
                  r="70"
                  style={{
                    strokeDasharray: `${pendientesPorcentaje * 4.4} 440`,
                    strokeDashoffset: `${
                      -(completadasPorcentaje + enProgresoPorcentaje) * 4.4
                    }`,
                  }}
                />
              </svg>
              <div className="progreso-dona-center">
                <span className="progreso-dona-total">{totalMisiones}</span>
                <span className="progreso-dona-label">Misiones</span>
              </div>
            </div>

            <div className="progreso-misiones-leyenda">
              <div className="progreso-leyenda-item">
                <div className="progreso-leyenda-color completadas"></div>
                <div className="progreso-leyenda-info">
                  <span className="progreso-leyenda-label">Completadas</span>
                  <span className="progreso-leyenda-valor">
                    {estadoMisiones.completadas}
                  </span>
                </div>
              </div>
              <div className="progreso-leyenda-item">
                <div className="progreso-leyenda-color en-progreso"></div>
                <div className="progreso-leyenda-info">
                  <span className="progreso-leyenda-label">En progreso</span>
                  <span className="progreso-leyenda-valor">
                    {estadoMisiones.enProgreso}
                  </span>
                </div>
              </div>
              <div className="progreso-leyenda-item">
                <div className="progreso-leyenda-color pendientes"></div>
                <div className="progreso-leyenda-info">
                  <span className="progreso-leyenda-label">Pendientes</span>
                  <span className="progreso-leyenda-valor">
                    {estadoMisiones.pendientes}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Segunda fila: Métricas generales + Estadísticas de aprendizaje */}
      <div className="progreso-bottom-grid">
        {/* Métricas generales */}
        <div className="progreso-metricas-wrapper">
          <h2 className="progreso-section-title">Métricas generales</h2>
          <div className="progreso-metricas-grid">
            <div className="progreso-metrica-card">
              <div className="progreso-metrica-icon">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path
                    fillRule="evenodd"
                    d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h6a1 1 0 100-2H7z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="progreso-metrica-info">
                <span className="progreso-metrica-valor">
                  {metricas.totalMisiones}
                </span>
                <span className="progreso-metrica-label">Total de misiones</span>
              </div>
            </div>

            <div className="progreso-metrica-card">
              <div className="progreso-metrica-icon">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="progreso-metrica-info">
                <span className="progreso-metrica-valor">
                  {metricas.misionesCompletadas}
                </span>
                <span className="progreso-metrica-label">
                  Misiones completadas
                </span>
              </div>
            </div>

            <div className="progreso-metrica-card">
              <div className="progreso-metrica-icon">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="progreso-metrica-info">
                <span className="progreso-metrica-valor">
                  {metricas.tiempoEstudio}
                </span>
                <span className="progreso-metrica-label">Tiempo de estudio</span>
              </div>
            </div>
          </div>
        </div>

        {/* Estadísticas de aprendizaje */}
        <div className="progreso-estadisticas-wrapper">
          <h2 className="progreso-section-title">Estadísticas de aprendizaje</h2>
          <div className="progreso-estadisticas-content">
            {estadisticasAprendizaje.map((stat, index) => (
              <div key={index} className="progreso-estadistica-item">
                <div className="progreso-estadistica-header">
                  <span className="progreso-estadistica-tema">{stat.tema}</span>
                  <span className="progreso-estadistica-porcentaje">
                    {stat.progreso}%
                  </span>
                </div>
                <div className="progreso-estadistica-bar-bg">
                  <div
                    className="progreso-estadistica-bar-fill"
                    style={{
                      width: `${stat.progreso}%`,
                      background: `linear-gradient(90deg, ${stat.color}, ${stat.color}dd)`,
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EstudianteProgreso;
