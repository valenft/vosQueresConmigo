const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  age: Number,
  gender: String,
  bio: { type: String, default: '', required: false },
  profilePhoto: { type: String, default: '' }, // Foto de perfil principal
  photos: [{ type: String, default: [] }], // Fotos adicionales (máximo 4)
  preferences: {
    lookingFor: { type: String, default: '' }, // Qué busca
    interests: [{ type: String, default: [] }], // Intereses/hobbies
    location: { type: String, default: '' }
  },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  matches: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

module.exports = mongoose.model('User', userSchema); 