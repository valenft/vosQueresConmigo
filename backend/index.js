// api/index.js
const express = require('express');
const app = express();
const PORT = 3001;
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');


mongoose.connect('mongodb://localhost:27017/citas')

app.use(express.json());
app.use(cors())

// Importar el modelo de usuario
const User = require('./models/user');
const authMiddleware = require('./authMiddleware');
require('dotenv').config();

console.log('JWT_TOKEN:', process.env.JWT_TOKEN);
console.log('JWT_SECRET:', process.env.JWT_SECRET);

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('API de citas funcionando!');
});

// Endpoint para registrar un nuevo usuario
app.post('/register', async (req, res) => {
  try {
    const { name, email, password, age, gender } = req.body;

    // Validar que el email no esté registrado
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear y guardar el nuevo usuario
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      age,
      gender
      // bio se creará automáticamente como string vacío por el default del modelo
    });
    await newUser.save();

    res.status(201).json({ message: 'Usuario creado con éxito' });
  } catch (error) {
    console.error(error); // Mostrar el error real en la consola
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});

// Endpoint para login de usuario
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar usuario por email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Usuario no encontrado' });
    }

    // Verificar contraseña
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Contraseña incorrecta' });
    }

    // Genera el token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_TOKEN,
      { expiresIn: '1d' }
    );

    // Login exitoso
    res.json({ message: 'Login exitoso', user: { id: user._id, name: user.name, email: user.email }, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

// Endpoint para dar like a un usuario y detectar match
app.post('/like', async (req, res) => {
  try {
    const { fromUserId, toUserId } = req.body;
    if (!fromUserId || !toUserId) {
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }
    if (fromUserId === toUserId) {
      return res.status(400).json({ error: 'No puedes darte like a ti mismo' });
    }

    // Buscar ambos usuarios
    const fromUser = await User.findById(fromUserId);
    const toUser = await User.findById(toUserId);
    if (!fromUser || !toUser) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Si ya le dio like antes, no hacer nada
    if (fromUser.likes.includes(toUserId)) {
      return res.status(200).json({ message: 'Ya le diste like a este usuario' });
    }

    // Agregar el like
    fromUser.likes.push(toUserId);
    await fromUser.save();

    // Verificar si hay match
    let isMatch = false;
    if (toUser.likes.includes(fromUserId)) {
      // Es un match: agregar ambos a matches si no están
      if (!fromUser.matches.includes(toUserId)) {
        fromUser.matches.push(toUserId);
      }
      if (!toUser.matches.includes(fromUserId)) {
        toUser.matches.push(fromUserId);
      }
      await fromUser.save();
      await toUser.save();
      isMatch = true;
    }

    res.json({ message: isMatch ? '¡Es un match!' : 'Like registrado', match: isMatch });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al procesar el like' });
  }
});

// Endpoint para obtener los matches de un usuario
app.get('/matches/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).populate('matches', 'name email age gender bio');
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json({ matches: user.matches });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener matches' });
  }
});

app.get('/perfil', authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.userId);
  res.json(user);
});

// Endpoint para obtener usuarios para mostrar (excluye al usuario logueado)
app.get('/usuarios', authMiddleware, async (req, res) => {
  try {
    const currentUserId = req.user.userId;
    
    // Obtener usuarios que no sean el usuario actual
    const usuarios = await User.find({ 
      _id: { $ne: currentUserId } 
    }).select('name age gender bio profilePhoto photos preferences');
    
    res.json(usuarios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

// Endpoint para obtener un usuario específico por ID
app.get('/usuarios/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const usuario = await User.findById(userId).select('name age gender bio profilePhoto photos preferences');
    
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    res.json(usuario);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener usuario' });
  }
});

// Endpoint para actualizar el perfil del usuario
app.put('/perfil', authMiddleware, async (req, res) => {
  try {
    const { name, age, gender, bio, profilePhoto, photos, preferences } = req.body;
    
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Actualizar los campos básicos
    user.name = name;
    user.age = age;
    user.gender = gender;
    user.bio = bio;
    
    // Actualizar foto de perfil si se proporciona
    if (profilePhoto !== undefined) {
      user.profilePhoto = profilePhoto;
    }
    
    // Actualizar fotos adicionales si se proporcionan
    if (photos) {
      user.photos = photos;
    }
    
    // Actualizar preferencias si se proporcionan
    if (preferences) {
      user.preferences = {
        lookingFor: preferences.lookingFor || '',
        interests: preferences.interests || [],
        location: preferences.location || ''
      };
    }

    await user.save();
    
    res.json({ message: 'Perfil actualizado exitosamente', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar perfil' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

