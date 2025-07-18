import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './config/firebase';
import Login from './pages/Login';;
import {BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard';
import Profile from './components/dashboard/Profile';
import Latex from './components/dashboard/Latex';
import Interview from './components/dashboard/Interview';


const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-2xl font-semibold text-gray-700">
          🔥 Loading...
        </div>
      </div>
    );
  }
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={user ? <Dashboard user={user} /> : <Login />} />
          <Route path="/profile" element={user ? <Profile /> : <Login />} />
        <Route path="/latex" element={user ? <Latex /> : <Login />} />
        <Route path="/interview" element={user ? <Interview /> : <Login />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;