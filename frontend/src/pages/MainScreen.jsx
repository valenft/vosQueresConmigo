import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './MainScreen.css';

export default function MainScreen() {
  const [usuarios, setUsuarios] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const res = await fetch('http://localhost:3001/usuarios', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        const data = await res.json();
        setUsuarios(data);
      } else {
        navigate('/login');
      }
    } catch (error) {
      console.error('Error fetching usuarios:', error);
      setMessage('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (currentIndex >= usuarios.length) return;
    
    try {
      const token = localStorage.getItem('token');
      const currentUser = usuarios[currentIndex];
      
      const res = await fetch('http://localhost:3001/like', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          fromUserId: getCurrentUserId(), // Necesitamos obtener el ID del usuario actual
          toUserId: currentUser._id
        })
      });

      const data = await res.json();
      
      if (data.match) {
        setMessage('¡Es un match! 🎉');
        setTimeout(() => setMessage(''), 3000);
      }
      
      nextUser();
    } catch (error) {
      console.error('Error al dar like:', error);
    }
  };

  const handleDislike = () => {
    nextUser();
  };

  const nextUser = () => {
    setCurrentIndex(prev => prev + 1);
  };

  const getCurrentUserId = () => {
    // Decodificar el token JWT para obtener el userId
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.userId;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  if (loading) {
    return (
      <div className="main-bg">
        <div className="loading-container">
          <div className="loading">Cargando usuarios...</div>
        </div>
      </div>
    );
  }

  if (usuarios.length === 0) {
    return (
      <div className="main-bg">
        <div className="no-users">
          <h2>No hay usuarios disponibles</h2>
          <p>¡Completá tu perfil para que otros te puedan ver!</p>
          <button className="main-btn" onClick={() => navigate('/profile')}>
            Completar Perfil
          </button>
        </div>
      </div>
    );
  }

  if (currentIndex >= usuarios.length) {
    return (
      <div className="main-bg">
        <div className="no-more-users">
          <h2>¡No hay más usuarios por ahora!</h2>
          <p>Volvé más tarde para ver nuevos perfiles</p>
          <button className="main-btn" onClick={() => setCurrentIndex(0)}>
            Ver de nuevo
          </button>
        </div>
      </div>
    );
  }

  const currentUser = usuarios[currentIndex];

  return (
    <div className="main-bg">
      <div className="main-header">
        <img src="/logo.png" alt="Logo" className="main-logo" />
        <h1>VosQueresConmigo</h1>
        <div className="header-actions">
          <button className="header-btn" onClick={() => navigate('/profile')}>
            👤
          </button>
          <button className="header-btn" onClick={() => navigate('/matches')} title="Ver matches y chats">
           💬
          </button>
          <button className="header-btn" onClick={handleLogout}>
            🚪
          </button>
        </div>
      </div>

      {message && <div className="match-message">{message}</div>}

      <div className="user-card">
        <div className="user-photos">
          {currentUser.profilePhoto ? (
            <img src={currentUser.profilePhoto} alt="Foto de perfil" className="user-main-photo" />
          ) : (
            <div className="user-no-photo">
              <span>📷</span>
              <p>Sin foto</p>
            </div>
          )}
          
          {currentUser.photos && currentUser.photos.length > 0 && (
            <div className="user-additional-photos">
              {currentUser.photos.slice(0, 3).map((photo, index) => (
                <img key={index} src={photo} alt={`Foto ${index + 1}`} className="user-additional-photo" />
              ))}
            </div>
          )}
        </div>

        <div className="user-info">
          <h2>{currentUser.name}, {currentUser.age}</h2>
          <p className="user-gender">{currentUser.gender}</p>
          
          {currentUser.bio && (
            <p className="user-bio">{currentUser.bio}</p>
          )}
          
          {currentUser.preferences?.location && (
            <p className="user-location">📍 {currentUser.preferences.location}</p>
          )}
          
          {currentUser.preferences?.lookingFor && (
            <p className="user-looking">Busco: {currentUser.preferences.lookingFor}</p>
          )}
          
          {currentUser.preferences?.interests && currentUser.preferences.interests.length > 0 && (
            <div className="user-interests">
              {currentUser.preferences.interests.slice(0, 5).map((interest, index) => (
                <span key={index} className="user-interest-tag">{interest}</span>
              ))}
            </div>
          )}
        </div>

        <div className="user-actions">
          <button className="action-btn dislike-btn" onClick={handleDislike}>
            ❌
          </button>
          <button className="action-btn like-btn" onClick={handleLike}>
            ❤️
          </button>
        </div>
      </div>

      <div className="user-counter">
        {currentIndex + 1} de {usuarios.length}
      </div>
    </div>
  );
} 