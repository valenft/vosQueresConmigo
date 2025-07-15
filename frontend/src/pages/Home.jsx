import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-bg">
      <div className="home-card">
        <img src="/logo.png" alt="Logo" className="home-logo" />
        <h1 className="home-title">VosQueresConmigo</h1>
        <p className="home-desc">
          La app de citas donde podés encontrar tu match ideal.<br />
          ¡Simple, segura y divertida!
        </p>
        <button className="btn-primary" onClick={() => navigate('/register')}>Registrarse</button>
        <button className="btn-secondary" onClick={() => navigate('/login')}>Iniciar sesión</button>
      </div>
      <footer className="home-footer">
        © {new Date().getFullYear()} VosQueresConmigo · Hecho con ❤️ para Enzo
      </footer>
    </div>
  );
}