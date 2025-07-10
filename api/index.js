// api/index.js
const express = require('express');
const app = express();
const PORT = 3001;
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

mongoose.connect('mongodb://localhost:27017/citas')

app.use(express.json());

// Importar el modelo de usuario
const User = require('./models/user');

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('API de citas funcionando!');
});

// Endpoint para registrar un nuevo usuario
app.post('/register', async (req, res) => {
  try {
    const { name, email, password, age, gender, bio } = req.body;

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
      gender,
      bio
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

    // Login exitoso
    res.json({ message: 'Login exitoso', user: { id: user._id, name: user.name, email: user.email } });
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

// El esquema y modelo de usuario se movieron a models/user.js
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
