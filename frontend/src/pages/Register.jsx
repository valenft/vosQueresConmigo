import React, { useState } from 'react';

export default function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    age: '',
    gender: '',
    bio: ''
  });
  const [message, setMessage] = useState('');

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
      } else {
        setMessage(data.error || 'Error al registrar');
      }
    } catch (err) {
      setMessage('Error de conexión');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '40px auto' }}>
      <h2>Registro</h2>
      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Nombre" value={form.name} onChange={handleChange} required /><br />
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required /><br />
        <input name="password" type="password" placeholder="Contraseña" value={form.password} onChange={handleChange} required /><br />
        <input name="age" type="number" placeholder="Edad" value={form.age} onChange={handleChange} required /><br />
        <input name="gender" placeholder="Género" value={form.gender} onChange={handleChange} /><br />
        <input name="bio" placeholder="Bio" value={form.bio} onChange={handleChange} /><br />
        <button type="submit">Registrarse</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}