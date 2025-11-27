// src/components/OwlLogin.jsx
import { useEffect, useRef } from "react";
import "../styles/owl.css";

function OwlLogin() {
  const leftPupilRef = useRef(null);
  const rightPupilRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const pupils = [leftPupilRef.current, rightPupilRef.current];

      pupils.forEach((pupil) => {
        if (!pupil || !pupil.parentElement) return;

        const rect = pupil.parentElement.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const dx = e.clientX - centerX;
        const dy = e.clientY - centerY;

        const angle = Math.atan2(dy, dx);
        const maxMove = 8; // radio máximo dentro del ojo (px)

        const x = Math.cos(angle) * maxMove;
        const y = Math.sin(angle) * maxMove;

        // Nos movemos respecto al centro (-50%, -50%)
        pupil.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="owl-container">
      <img
        src="/images/owl_body.png"
        alt="Luminia Owl"
        className="owl-body"
      />

      {/* ojo izquierdo */}
      <div className="eye eye-left">
        <div ref={leftPupilRef} className="pupil" />
      </div>

      {/* ojo derecho */}
      <div className="eye eye-right">
        <div ref={rightPupilRef} className="pupil" />
      </div>
    </div>
  );
}

export default OwlLogin;
