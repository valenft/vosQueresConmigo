import React, { useState } from 'react';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');

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
      const data = await res.json();
      if (res.ok) {
        setMessage('¡Login exitoso!');
        // Guardar el token en localStorage para futuras peticiones
        localStorage.setItem('token', data.token);
      } else {
        setMessage(data.error || 'Error al iniciar sesión');
      }
    } catch (err) {
      setMessage('Error de conexión');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '40px auto' }}>
      <h2>Iniciar sesión</h2>
      <form onSubmit={handleSubmit}>
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required /><br />
        <input name="password" type="password" placeholder="Contraseña" value={form.password} onChange={handleChange} required /><br />
        <button type="submit">Entrar</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

