import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './MainScreen.css';

export default function MatchesScreen() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newMatchIds, setNewMatchIds] = useState([]); // Para notificaciones
  const navigate = useNavigate();

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userId = payload.userId;
      const res = await fetch(`http://localhost:3001/matches/${userId}`);
      const data = await res.json();
      setMatches(data.matches || []);
      // Detectar nuevos matches (puedes mejorar esto con localStorage)
      const prevIds = JSON.parse(localStorage.getItem('seenMatches') || '[]');
      const currentIds = (data.matches || []).map(m => m._id);
      const newOnes = currentIds.filter(id => !prevIds.includes(id));
      setNewMatchIds(newOnes);
      localStorage.setItem('seenMatches', JSON.stringify(currentIds));
    } catch (error) {
      console.error('Error al cargar matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChat = (match) => {
    navigate(`/chat/${match._id}`, { state: { match } });
  };

  if (loading) {
    return (
      <div className="main-bg">
        <div className="loading-container">
          <div className="loading">Cargando matches...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-bg">
      <div className="main-header">
        <img src="/logo.png" alt="Logo" className="main-logo" />
        <h1>Chats & Matches</h1>
        <div className="header-actions">
          <button className="header-btn" onClick={() => navigate('/main')}>⬅️</button>
        </div>
      </div>
      <div style={{ width: '100%', maxWidth: 400 }}>
        {matches.length === 0 ? (
          <div className="no-users">
            <h2>No tenés matches todavía</h2>
            <p>¡Dale like a más personas para hacer match!</p>
          </div>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {matches.map(match => (
              <li key={match._id} style={{ marginBottom: 16, position: 'relative' }}>
                <div
                  className="user-card"
                  style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 12 }}
                  onClick={() => handleOpenChat(match)}
                >
                  <img
                    src={match.profilePhoto || '/default-profile.png'}
                    alt={match.name}
                    style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', marginRight: 16 }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 'bold', fontSize: 18 }}>{match.name}, {match.age}</div>
                    <div style={{ color: '#666', fontSize: 14 }}>{match.bio || 'Sin bio'}</div>
                  </div>
                  {newMatchIds.includes(match._id) && (
                    <span className="chat-badge">¡Nuevo!</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
} 