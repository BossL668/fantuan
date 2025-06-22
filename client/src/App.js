import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import GroupListPage from './pages/GroupListPage';
import GroupChatPage from './pages/GroupChatPage';
import FriendsPage from './pages/FriendsPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import './App.css';

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/groups" element={<PrivateRoute><GroupListPage /></PrivateRoute>} />
          <Route path="/groups/:id" element={<PrivateRoute><GroupChatPage /></PrivateRoute>} />
          <Route path="/friends" element={<PrivateRoute><FriendsPage /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/groups" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App; 