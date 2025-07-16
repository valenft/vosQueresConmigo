import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import MainScreen from './pages/MainScreen';
import MatchesScreen from './pages/MatchesScreen';
import ChatScreen from './pages/ChatScreen';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/main" element={<MainScreen />} />
        <Route path="/matches" element={<MatchesScreen />} />
        <Route path="/chat/:id" element={<ChatScreen />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
