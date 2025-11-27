// src/pages/SobreNosotros.jsx
// Página "Sobre nosotros" de Luminia.
// Muestra una descripción de la plataforma y una ilustración de estudiantes.

import Header from "../components/Header";
import "../styles/sobreNosotros.css";

function SobreNosotros() {
  return (
    <div
      className="sobre-page text-white flex flex-col overflow-hidden"
      // Fuente base para toda la página
      style={{
        fontFamily:
          '"Inter", "Roboto", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <style>{`
        @keyframes float-gentle {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-text {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.85; }
        }
        @keyframes shimmer-line {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes glow-border {
          0%, 100% { box-shadow: 0 0 20px rgba(255,255,255,0.1); }
          50% { box-shadow: 0 0 40px rgba(255,255,255,0.3); }
        }
        @keyframes scale-on-hover {
          0% { transform: scale(1); }
          100% { transform: scale(1.02); }
        }
        
        .animate-sobre-text {
          animation: fade-in-up 1s ease-out;
        }
        
        .animate-sobre-image {
          animation: fade-in-up 1s ease-out 0.3s backwards;
        }
        
        .image-float {
          animation: float-gentle 6s ease-in-out infinite;
        }
        
        .image-interactive:hover {
          animation: float-gentle 2s ease-in-out infinite;
          filter: drop-shadow(0 0 30px rgba(255,255,255,0.3));
        }
        
        .paragraph-hover {
          transition: all 0.3s ease;
          padding-left: 0;
          border-left: 3px solid transparent;
        }
        
        .paragraph-hover:hover {
          padding-left: 1rem;
          border-left-color: rgba(255,255,255,0.5);
          transform: translateX(5px);
          background: rgba(255,255,255,0.05);
          border-radius: 8px;
          padding-right: 1rem;
          padding-top: 0.5rem;
          padding-bottom: 0.5rem;
        }
        
        .title-glow {
          position: relative;
          display: inline-block;
        }
        
        .title-glow::after {
          content: '';
          position: absolute;
          bottom: -10px;
          left: 0;
          width: 100%;
          height: 4px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent);
          animation: shimmer-line 3s ease-in-out infinite;
        }
        
        .title-glow:hover {
          text-shadow: 0 0 20px rgba(255,255,255,0.6), 0 0 40px rgba(34,139,230,0.4);
          animation: pulse-text 2s ease-in-out infinite;
        }
      `}</style>

      {/* Fondo general con imagen */}
      <div
        className="flex-1 flex flex-col"
        style={{
          backgroundImage: 'url("/images/fondo_nosotros.png")',
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Header reutilizable (logo + menú) */}
        <Header />

        {/* Contenido principal */}
        <main
          className="
            relative
            flex-1
            w-full
            px-4 lg:px-10 xl:px-16   /* padding lateral moderado */
            flex
            items-center
            justify-center           /* centra el bloque principal */
          "
        >
          {/* ÚNICA capa oscura horizontal que mejora la legibilidad del texto */}
          <div className="bg-overlay"></div>

          {/* Contenedor del contenido (texto + imagen)
              - max-w-6xl limita el ancho para que no se abra tanto
              - mx-auto lo centra horizontalmente
              - gap pequeño para que texto e imagen estén más juntos */}
          <section
            className="
              sobre-contenido
              relative
              grid grid-cols-1 lg:grid-cols-2
              gap-2 xl:gap-4          /* separación mínima entre columnas */
              items-center
              w-full
              max-w-7xl               /* ancho máximo del contenido */
              mx-auto                 
            "
          >
            {/* Columna izquierda: texto descriptivo */}
            <div
              className="
                animate-sobre-text
                lg:pr-0               /* sin padding extra a la derecha para acercarlo a la imagen */
              "
            >
              <h1
                className="
                  text-5xl md:text-6xl lg:text-7xl xl:text-6xl
                  font-extrabold
                  mb-8
                  title-glow
                  cursor-default
                "
                style={{
                  fontFamily: '"Poppins", "Montserrat", sans-serif',
                  fontWeight: 800,
                }}
              >
                Sobre nosotros
              </h1>

              {/* Texto principal de la sección
                  - text-lg / md:text-xl: tamaño legible
                  - space-y-6: separación entre párrafos */}
              <div className="space-y-9 text-lg md:text-xl leading-relaxed">
                <p className="paragraph-hover cursor-default">
                  Luminia nació con la idea de demostrar que aprender puede ser
                  una aventura. Combinamos el mundo del juego de rol con
                  herramientas educativas para crear una experiencia donde el
                  conocimiento se conquista a través de misiones, logros y
                  desafíos.
                </p>

                <p className="paragraph-hover cursor-default">
                  Nuestro propósito es transformar la educación tradicional en
                  un proceso dinámico, inclusivo y motivador. Cada estudiante es
                  protagonista de su propio camino, desarrollando habilidades
                  como la autonomía, la cooperación y la resolución de problemas
                  mientras se divierte aprendiendo.
                </p>

                <p className="paragraph-hover cursor-default">
                  Creemos que la tecnología debe ser una aliada en el
                  aprendizaje, no un obstáculo. Por eso, en Luminia unimos
                  diseño, pedagogía y desarrollo web para ofrecer una
                  plataforma accesible, segura y pensada para todos.
                </p>
              </div>
            </div>

            {/* Columna derecha: ilustración de estudiantes */}
            <div className="flex justify-center lg:justify-end animate-sobre-image">
              <img
                src="/images/estudiantes_nosotros.png"
                alt="Estudiantes aprendiendo juntos"
                className="
                  w-full
                  max-w-md            /* tamaño base de la imagen */
                  md:max-w-lg
                  lg:max-w-5xl
                  xl:max-w-2xl        /* crece en pantallas grandes sin exagerar */
                  object-contain
                  drop-shadow-xl
                  image-float
                  image-interactive
                  cursor-pointer
                  transition-all
                  duration-500
                  hover:scale-105
                "
              />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default SobreNosotros;