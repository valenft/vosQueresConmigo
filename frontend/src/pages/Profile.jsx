import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    name: '',
    age: '',
    gender: '',
    bio: '',
    profilePhoto: '',
    photos: [],
    preferences: {
      lookingFor: '',
      interests: [],
      location: ''
    }
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [newInterest, setNewInterest] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const res = await fetch('http://localhost:3001/perfil', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
        setForm({
          name: userData.name || '',
          age: userData.age || '',
          gender: userData.gender || '',
          bio: userData.bio || '',
          profilePhoto: userData.profilePhoto || '',
          photos: userData.photos || [],
          preferences: {
            lookingFor: userData.preferences?.lookingFor || '',
            interests: userData.preferences?.interests || [],
            location: userData.preferences?.location || ''
          }
        });
      } else {
        navigate('/login');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = e => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setForm(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    const urls = files.map(file => URL.createObjectURL(file));
    setForm(prev => ({
      ...prev,
      photos: [...prev.photos, ...urls].slice(0, 4) // Máximo 4 fotos adicionales
    }));
  };

  const removePhoto = (index) => {
    setForm(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const addInterest = () => {
    if (newInterest.trim() && !form.preferences.interests.includes(newInterest.trim())) {
      setForm(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          interests: [...prev.preferences.interests, newInterest.trim()]
        }
      }));
      setNewInterest('');
    }
  };

  const removeInterest = (interest) => {
    setForm(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        interests: prev.preferences.interests.filter(i => i !== interest)
      }
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage('');
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3001/perfil', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...form,
          profilePhoto: form.profilePhoto
        })
      });

      const data = await res.json();
      if (res.ok) {
        setMessage('Perfil actualizado exitosamente!');
        setUser({ ...user, ...form });
        setIsEditing(false);
      } else {
        setMessage(data.error || 'Error al actualizar perfil');
      }
    } catch (error) {
      setMessage('Error de conexión');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  if (loading) {
    return (
      <div className="profile-bg">
        <div className="profile-card">
          <div className="loading">Cargando perfil...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-bg">
      <div className="profile-card">
        <img src="/logo.png" alt="Logo" className="profile-logo" />
        <h2 className="profile-title">Mi Perfil</h2>
        
        {!isEditing ? (
          // MODO VISUALIZACIÓN
          <div className="profile-view">
            <div className="profile-photos">
              {user.profilePhoto && (
                <div className="profile-photo-preview">
                  <img src={user.profilePhoto} alt="Foto de perfil" />
                </div>
              )}
              {user.photos && user.photos.length > 0 ? (
                <div className="photos-grid">
                  {user.photos.map((photo, index) => (
                    <div key={index} className="photo-item">
                      <img src={photo} alt={`Foto ${index + 1}`} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-photos">
                  <div className="photo-placeholder">📷</div>
                  <p>No hay fotos subidas</p>
                </div>
              )}
            </div>

            <div className="profile-info">
              <h3>{user.name}, {user.age}</h3>
              <p className="profile-gender">{user.gender}</p>
              {user.bio && <p className="profile-bio">{user.bio}</p>}
              
              {user.preferences?.location && (
                <p className="profile-location">📍 {user.preferences.location}</p>
              )}
              
              {user.preferences?.lookingFor && (
                <p className="profile-looking">Busco: {user.preferences.lookingFor}</p>
              )}
              
              {user.preferences?.interests && user.preferences.interests.length > 0 && (
                <div className="profile-interests">
                  <h4>Intereses:</h4>
                  <div className="interests-tags">
                    {user.preferences.interests.map((interest, index) => (
                      <span key={index} className="interest-tag">{interest}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="profile-actions">
              <button className="profile-btn" onClick={() => setIsEditing(true)}>
                Modificar Perfil
              </button>
              <button className="profile-btn-secondary" onClick={() => navigate('/home')}>
                Ir al Inicio
              </button>
              <button className="profile-btn-logout" onClick={handleLogout}>
                Cerrar Sesión
              </button>
            </div>
          </div>
        ) : (
          // MODO EDICIÓN
          <form onSubmit={handleSubmit} className="profile-edit">
            <div className="profile-field">
              <label>Nombre</label>
              <input
                className="profile-input"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="profile-field">
              <label>Edad</label>
              <input
                className="profile-input"
                name="age"
                type="number"
                value={form.age}
                onChange={handleChange}
                required
              />
            </div>

            <div className="profile-field">
              <label>Género</label>
              <select
                className="profile-input"
                name="gender"
                value={form.gender}
                onChange={handleChange}
                required
              >
                <option value="">Selecciona tu género</option>
                <option value="masculino">Masculino</option>
                <option value="femenino">Femenino</option>
                <option value="si a todo">Si a todo</option>
              </select>
            </div>

            <div className="profile-field">
              <label>Bio</label>
              <textarea
                className="profile-textarea"
                name="bio"
                placeholder="Cuéntanos sobre ti..."
                value={form.bio}
                onChange={handleChange}
                rows="4"
              />
            </div>

            <div className="profile-field">
              <label>Foto de Perfil</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setForm(prev => ({ ...prev, profilePhoto: reader.result }));
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
              {form.profilePhoto && (
                <div className="profile-photo-preview">
                  <img src={form.profilePhoto} alt="Foto de perfil" />
                </div>
              )}
            </div>

            <div className="profile-field">
              <label>Ubicación</label>
              <input
                className="profile-input"
                name="preferences.location"
                placeholder="¿Dónde vivís?"
                value={form.preferences.location}
                onChange={handleChange}
              />
            </div>

            <div className="profile-field">
              <label>¿Qué buscás?</label>
              <input
                className="profile-input"
                name="preferences.lookingFor"
                placeholder="Ej: Amistad, relación seria, etc."
                value={form.preferences.lookingFor}
                onChange={handleChange}
              />
            </div>

            <div className="profile-field">
              <label>Fotos Adicionales (máximo 4)</label>
              <div className="photos-upload">
                {form.photos.map((photo, index) => (
                  <div key={index} className="photo-preview">
                    <img src={photo} alt={`Foto ${index + 1}`} />
                    <button type="button" onClick={() => removePhoto(index)} className="remove-photo">×</button>
                  </div>
                ))}
                {form.photos.length < 4 && (
                  <label className="upload-btn">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePhotoUpload}
                      style={{ display: 'none' }}
                    />
                    <span>+</span>
                  </label>
                )}
              </div>
            </div>

            <div className="profile-field">
              <label>Intereses</label>
              <div className="interests-input">
                <input
                  className="profile-input"
                  placeholder="Agregar interés..."
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInterest())}
                />
                <button type="button" onClick={addInterest} className="add-interest-btn">+</button>
              </div>
              {form.preferences.interests.length > 0 && (
                <div className="interests-tags">
                  {form.preferences.interests.map((interest, index) => (
                    <span key={index} className="interest-tag">
                      {interest}
                      <button type="button" onClick={() => removeInterest(interest)}>×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="profile-edit-actions">
              <button className="profile-btn" type="submit">
                Guardar Cambios
              </button>
              <button type="button" className="profile-btn-secondary" onClick={() => setIsEditing(false)}>
                Cancelar
              </button>
            </div>
          </form>
        )}

        {message && <div className="profile-message">{message}</div>}
      </div>
    </div>
  );
} 