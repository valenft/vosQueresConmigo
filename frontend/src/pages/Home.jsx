import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: 'center', marginTop: 80 }}>
      <h1>VosQueresConmigo</h1>
      <p>La app de citas donde podés encontrar tu match ideal. ¡Simple, segura y divertida!</p>
      <button onClick={() => navigate('/register')} style={{ margin: 10, padding: 10 }}>Registrarse</button>
      <button onClick={() => navigate('/login')} style={{ margin: 10, padding: 10 }}>Iniciar sesión</button>
    </div>
  );
}