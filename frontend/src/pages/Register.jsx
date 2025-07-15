import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Register.css';

export default function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    age: '',
    gender: ''
  });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await fetch('http://localhost:3001/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('¡Registro exitoso! Ahora puedes iniciar sesión.');
        setTimeout(() => navigate('/login'), 1200);
      } else {
        setMessage(data.error || 'Error al registrar');
      }
    } catch (err) {
      setMessage('Error de conexión');
    }
  };

  return (
    <div className="register-bg">
      <form className="register-card" onSubmit={handleSubmit}>
        <img src="/logo.png" alt="Logo" className="register-logo" />
        <h2 className="register-title">Crear cuenta</h2>
        <input
          className="register-input"
          name="name"
          placeholder="Nombre"
          value={form.name}
          onChange={handleChange}
          required
        />
        <input
          className="register-input"
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          className="register-input"
          name="password"
          type="password"
          placeholder="Contraseña"
          value={form.password}
          onChange={handleChange}
          required
        />
        <input
          className="register-input"
          name="age"
          type="number"
          placeholder="Edad"
          value={form.age}
          onChange={handleChange}
          required
        />
        <select
          className="register-input"
          name="gender"
          value={form.gender}
          onChange={handleChange}
          required
        >
          <option value="" disabled>Selecciona tu género</option>
          <option value="masculino">Masculino</option>
          <option value="femenino">Femenino</option>
          <option value="si a todo">Si a todo</option>
        </select>
        <button className="register-btn" type="submit">Registrarse</button>
        {message && <div className="register-message">{message}</div>}
        <div className="register-link">
          ¿Ya tenés cuenta? <span onClick={() => navigate('/login')}>Iniciar sesión</span>
        </div>
      </form>
    </div>
  );
}