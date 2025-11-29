// src/pages/estudiante/EstudianteLogros.jsx
// Página de logros del panel de estudiantes

import "../../styles/estudianteLogros.css";

function EstudianteLogros() {
  const logros = [
    {
      id: 1,
      titulo: "Primer explorador",
      descripcion: "Completaste tu primera misión",
      fecha: "23/04/2025",
      estado: "desbloqueado",
      tipo: "oro",
    },
    {
      id: 2,
      titulo: "Maestro de las fracciones",
      descripcion: "Dominas las operaciones con fracciones",
      fecha: "10/07/2025",
      estado: "desbloqueado",
      tipo: "azul",
    },
    {
      id: 3,
      titulo: "Dominio básico de ecuaciones",
      descripcion: "Has resuelto ecuaciones de primer grado",
      fecha: "15/07/2025",
      estado: "desbloqueado",
      tipo: "cian",
    },
    {
      id: 4,
      titulo: "Logro bloqueado",
      descripcion: "Completa más misiones para desbloquear",
      estado: "bloqueado",
      tipo: "bloqueado",
    },
    {
      id: 5,
      titulo: "Logro bloqueado",
      descripcion: "Completa más misiones para desbloquear",
      estado: "bloqueado",
      tipo: "bloqueado",
    },
    {
      id: 6,
      titulo: "Logro bloqueado",
      descripcion: "Completa más misiones para desbloquear",
      estado: "bloqueado",
      tipo: "bloqueado",
    },
  ];

  const getCardClass = (logro) => {
    const base = "logro-card";
    if (logro.estado === "bloqueado") return `${base} logro-card-bloqueado`;
    return `${base} logro-card-${logro.tipo}`;
  };

  return (
  <div className="estudiante-logros-page">
    {/* 🔹 Fondo fijo */}
    <div className="logros-bg"></div>

    {/* 🔹 Contenido encima del fondo */}
    <div className="logros-overlay">
      <div className="logros-header">
        <h1 className="logros-title">Logros</h1>
        <p className="logros-subtitle">
          Estos son los hitos que has alcanzado,
          <br />
          <span className="logros-subtitle-strong">
            ¡Sigue aprendiendo para conseguir más recompensas!
          </span>
        </p>
      </div>

        {/* Grid de tarjetas de logros */}
        <div className="logros-grid">
          {logros.map((logro) => (
            <div key={logro.id} className={getCardClass(logro)}>
              <div className="logro-icon-wrapper">
                {logro.estado === "bloqueado" ? (
                  <div className="logro-icon-circle locked">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path
                        d="M12 3a4 4 0 00-4 4v3H7a2 2 0 00-2 2v7a2 2 0 002 2h10a2 2 0 002-2v-7a2 2 0 00-2-2h-1V7a4 4 0 00-4-4z"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M12 14v3"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle cx="12" cy="12" r="0.75" fill="currentColor" />
                    </svg>
                  </div>
                ) : (
                  <div className={`logro-icon-circle ${logro.tipo}`}>
                    {/* Medalla / insignia simple */}
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <circle
                        cx="12"
                        cy="9"
                        r="5"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M9 14l-2 7 5-3 5 3-2-7"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M10 9l1 1 2-2"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                )}
              </div>

              <div className="logro-info">
                <h3 className="logro-title">{logro.titulo}</h3>
                <p className="logro-description">{logro.descripcion}</p>
                {logro.fecha && (
                  <span className="logro-date">{logro.fecha}</span>
                )}
                {logro.estado === "bloqueado" && (
                  <span className="logro-tag-bloqueado">Bloqueado</span>
                )}
              </div>

              {logro.estado === "desbloqueado" && (
                <div className="logro-ribbon">
                  <span>¡Desbloqueado!</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default EstudianteLogros;
