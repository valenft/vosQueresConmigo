import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './MainScreen.css';

export default function MainScreen() {
  const [usuarios, setUsuarios] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [showBar, setShowBar] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
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
          fromUserId: getCurrentUserId(),
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
    setCurrentPhotoIndex(0);
  };

  const previousUser = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setCurrentPhotoIndex(0);
    }
  };

  const nextPhoto = () => {
    const currentUser = usuarios[currentIndex];
    const totalPhotos = 1 + (currentUser.photos?.length || 0);
    setCurrentPhotoIndex(prev => (prev + 1) % totalPhotos);
  };

  const previousPhoto = () => {
    const currentUser = usuarios[currentIndex];
    const totalPhotos = 1 + (currentUser.photos?.length || 0);
    setCurrentPhotoIndex(prev => (prev - 1 + totalPhotos) % totalPhotos);
  };

  const getCurrentUserId = () => {
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

  const getCurrentPhoto = () => {
    const currentUser = usuarios[currentIndex];
    if (!currentUser) return null;
    if (currentPhotoIndex === 0) {
      return currentUser.profilePhoto;
    } else {
      return currentUser.photos?.[currentPhotoIndex - 1];
    }
  };

  const getTotalPhotos = () => {
    const currentUser = usuarios[currentIndex];
    if (!currentUser) return 0;
    return 1 + (currentUser.photos?.length || 0);
  };

  // Compatibilidad real por intereses en común
  const calculateCompatibility = () => {
    const currentUser = usuarios[currentIndex];
    const myToken = localStorage.getItem('token');
    if (!myToken || !currentUser) return 0;
    let myInterests = [];
    try {
      const payload = JSON.parse(atob(myToken.split('.')[1]));
      myInterests = payload.interests || [];
    } catch {}
    const otherInterests = currentUser.preferences?.interests || [];
    if (!myInterests.length || !otherInterests.length) return 70;
    const common = myInterests.filter(i => otherInterests.includes(i));
    const percent = Math.round((common.length / Math.max(myInterests.length, otherInterests.length)) * 100);
    return Math.max(70, Math.min(100, percent));
  };

  // Header fijo
  const Header = () => (
    <header className="main-header-fixed">
      <div className="header-left" onClick={() => navigate('/')}
        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
        <img src="/logo.png" alt="Logo" className="main-header-logo" />
        <span className="main-header-title">Vos Queres Conmigo</span>
      </div>
      <nav className="header-nav">
        <button className="header-nav-btn" onClick={() => navigate('/main')} title="Inicio">
          Inicio
        </button>
        <button className="header-nav-btn" onClick={() => navigate('/profile')} title="Perfil">
          Perfil
        </button>
        <button className="header-nav-btn" onClick={() => { localStorage.removeItem('token'); navigate('/'); }} title="Cerrar sesión">
          Salir
        </button>
        <button className="header-hamburger" onClick={() => setShowMenu(!showMenu)}>
          <span className="hamburger-icon">☰</span>
        </button>
      </nav>
      {showMenu && (
        <div className="header-menu-mobile">
          <button onClick={() => { setShowMenu(false); navigate('/main'); }}>Inicio</button>
          <button onClick={() => { setShowMenu(false); navigate('/profile'); }}>Perfil</button>
          <button onClick={() => { setShowMenu(false); localStorage.removeItem('token'); navigate('/'); }}>Salir</button>
        </div>
      )}
    </header>
  );

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
  const compatibility = calculateCompatibility();

  return (
    <div className="main-bg">
      <Header />
      <div className="left-column">
        <div className="branding-section">
          <div className="logo-section">
            <img src="/logo.png" alt="Logo" className="brand-logo" />
            <h1 className="brand-title">VOS QUERES CONMIGO</h1>
          </div>
          <div className="promo-content">
            <h2 className="promo-title">
              Hacela fácil: hacé <span className="highlight">match</span> 🔥
            </h2>
            <p className="promo-subtitle">
              Más de 10.000 personas ya hicieron match!
            </p>
          </div>
          <div className="search-section">
            <div className="search-bar">
              <span className="search-icon">🔍</span>
              <input 
                type="text" 
                placeholder="Buscá nombres, categorías, edad..." 
                className="search-input"
              />
            </div>
          </div>
        </div>
        {/* Eliminados los navigation-icons (❌ ⬅️) */}
      </div>
      <div className="right-column">
        <div className="header-actions" style={{ display: 'none' }} />
        {message && <div className="match-message">{message}</div>}
        <div className="user-card"
          onMouseEnter={() => setShowBar(true)}
          onMouseLeave={() => setShowBar(false)}
          style={{ background: 'linear-gradient(135deg, #f8fafc 60%, #ffe0ec 100%)' }}
        >
          {/* Barra superior */}
          <div className="user-card-top">
            <div className="compatibility-badge">
              Compatibilidad: {compatibility}% <span role="img" aria-label="corazon">❤️</span>
            </div>
            <button className="info-btn-top" title="Ver perfil completo">
              <span role="img" aria-label="info">ℹ️</span>
            </button>
          </div>
          {/* Detalles */}
          <div className="user-card-details">
            <div className="detail-item">
              <span className="detail-icon">🎓</span>
              <span>Estudiante</span>
            </div>
          </div>
          {/* Foto principal */}
          <div className="user-card-photo">
            {getCurrentPhoto() ? (
              <img src={getCurrentPhoto()} alt="Foto de usuario" className="user-main-photo" />
            ) : (
              <div className="user-no-photo">
                <span role="img" aria-label="camara" style={{ fontSize: 40 }}>📷</span>
                <p>Sin foto</p>
              </div>
            )}
          </div>
          {/* Barra inferior (hover) */}
          <div className={`user-card-bottom${showBar ? ' show' : ''}`}>
            <span className="user-card-name">{currentUser.name} {currentUser.age}</span>
            <div className="user-card-actions">
              <button className="action-btn dislike-btn" onClick={handleDislike}>
                <span role="img" aria-label="dislike">❌</span>
              </button>
              <button className="action-btn like-btn" onClick={handleLike}>
                <span role="img" aria-label="like">❤️</span>
              </button>
              <button className="chat-btn" title="Iniciar chat">
                <span role="img" aria-label="chat">💬</span>
              </button>
            </div>
          </div>
        </div>
        {/* Eliminada la bottom-navigation */}
      </div>
    </div>
  );
} 