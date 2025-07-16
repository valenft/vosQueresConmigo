import React, { useEffect, useState, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import './MainScreen.css';

// Componente para un mensaje individual
function MessageItem({ message, isOwn }) {
  return (
    <div style={{
      textAlign: isOwn ? 'right' : 'left',
      margin: '8px 0',
    }}>
      <div
        style={{
          display: 'inline-block',
          background: isOwn ? '#e75480' : '#f1f1f1',
          color: isOwn ? 'white' : '#333',
          borderRadius: 16,
          padding: '8px 14px',
          maxWidth: 220,
          fontSize: 15,
        }}
      >
        {message.content}
        <div style={{ fontSize: 11, color: isOwn ? '#ffe0ec' : '#888', marginTop: 4 }}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
}

// Componente para la lista de mensajes
function MessageList({ messages, currentUserId }) {
  const bottomRef = useRef(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  return (
    <div style={{ maxHeight: 350, overflowY: 'auto', padding: 8, background: '#fff', borderRadius: 12 }}>
      {messages.map(msg => (
        <MessageItem key={msg._id} message={msg} isOwn={msg.from === currentUserId} />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}

// Componente para el input de mensaje
function MessageInput({ onSend, loading }) {
  const [value, setValue] = useState('');
  const handleSend = () => {
    if (value.trim()) {
      onSend(value);
      setValue('');
    }
  };
  return (
    <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
      <input
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleSend()}
        placeholder="Escribe un mensaje..."
        style={{ flex: 1, padding: 10, borderRadius: 8, border: '1px solid #eee', fontSize: 15 }}
        disabled={loading}
      />
      <button
        className="main-btn"
        onClick={handleSend}
        disabled={loading || !value.trim()}
        style={{ minWidth: 60 }}
      >
        Enviar
      </button>
    </div>
  );
}

export default function ChatScreen() {
  const { id } = useParams(); // id del match
  const location = useLocation();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [matchUser, setMatchUser] = useState(location.state?.match || null);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    const payload = JSON.parse(atob(token.split('.')[1]));
    setCurrentUserId(payload.userId);
    if (!matchUser) {
      // Si no viene por state, buscar datos del usuario
      fetch(`http://localhost:3001/usuarios/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => setMatchUser(data));
    }
    fetchMessages(token, payload.userId);
    // eslint-disable-next-line
  }, [id]);

  const fetchMessages = async (token, userId) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3001/messages/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setMessages(data.messages || []);
    } catch (error) {
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (content) => {
    setSending(true);
    const token = localStorage.getItem('token');
    try {
      await fetch('http://localhost:3001/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ to: id, content })
      });
      fetchMessages(token, currentUserId);
    } catch (error) {
      // Manejar error
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="main-bg">
      <div className="main-header">
        <img src="/logo.png" alt="Logo" className="main-logo" />
        <h1 style={{ fontSize: 18, flex: 1 }}>
          {matchUser ? `Chat con ${matchUser.name}` : 'Chat'}
        </h1>
        <div className="header-actions">
          <button className="header-btn" onClick={() => navigate('/matches')}>⬅️</button>
        </div>
      </div>
      <div style={{ width: '100%', maxWidth: 400, margin: '0 auto', background: 'white', borderRadius: 16, padding: 16, boxShadow: '0 4px 16px rgba(231, 84, 128, 0.08)' }}>
        {loading ? (
          <div className="loading">Cargando mensajes...</div>
        ) : (
          <MessageList messages={messages} currentUserId={currentUserId} />
        )}
        <MessageInput onSend={handleSend} loading={sending} />
      </div>
    </div>
  );
} 