// src/components/Header.jsx
// Header principal reutilizable (logo + menú de navegación).

import { useNavigate } from "react-router-dom";

function Header() {
  const navigate = useNavigate(); // hook para navegar entre rutas

  return (
    <header className="w-full px-10 py-5 flex justify-between items-center flex-shrink-0">
      
      {/* Logo + marca (redirige al Login) */}
      <div
        className="flex items-center gap-3 transform hover:scale-105 transition-transform cursor-pointer"
        onClick={() => navigate("/login")}
      >
        <img
          src="/images/logo_sin_fondo.png"
          alt="Luminia Logo"
          className="w-12 h-12 object-contain animate-pulse"
        />
        <div className="leading-tight">
          <p
            className="text-xl"
            style={{
              fontFamily: '"Poppins", "Montserrat", sans-serif',
              fontWeight: 700,
            }}
          >
            Luminia
          </p>
          <p className="text-sm text-blue-100">Aprende Jugando</p>
        </div>
      </div>

      {/* Menú */}
      <nav className="hidden md:flex items-center gap-10 text-sm">
        
        {/* Sobre nosotros */}
        <button
          className="hover:text-slate-100 hover:scale-110 transition-all"
          onClick={() => navigate("/sobre-nosotros")}
        >
          Sobre nosotros
        </button>

        {/* Contacto */}
        <button
          className="hover:text-slate-100 hover:scale-110 transition-all"
          onClick={() => navigate("/contacto")}
        >
          Contacto
        </button>

        {/* Botón Ingresar → va al Login */}
        <button
          className="px-6 py-2 rounded-full shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all"
          style={{
            backgroundColor: "#228BE6",
            fontFamily: '"Poppins", "Montserrat", sans-serif',
            fontWeight: 600,
          }}
          onClick={() => navigate("/login")}
        >
          Ingresar
        </button>
      </nav>
    </header>
  );
}

export default Header;
