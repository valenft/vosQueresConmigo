import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await fetch('http://localhost:3001/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('token', data.token);
        setMessage('¡Login exitoso! Redirigiendo...');
        setTimeout(() => navigate('/main'), 1000);
      } else {
        const data = await res.json();
        setMessage(data.error || 'Error al iniciar sesión');
      }
    } catch (err) {
      setMessage('Error de conexión');
    }
  };

  return (
    <div className="login-bg">
      <form className="login-card" onSubmit={handleSubmit}>
        <img src="/logo.png" alt="Logo" className="login-logo" />
        <h2 className="login-title">Iniciar sesión</h2>
        <input
          className="login-input"
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          className="login-input"
          name="password"
          type="password"
          placeholder="Contraseña"
          value={form.password}
          onChange={handleChange}
          required
        />
        <button className="login-btn" type="submit">Entrar</button>
        {message && <div className="login-message">{message}</div>}
        <div className="login-link">
          ¿No tenés cuenta? <span onClick={() => navigate('/register')}>Registrate</span>
        </div>
      </form>
    </div>
  );
}