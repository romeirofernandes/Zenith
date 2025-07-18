import React, { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./config/firebase";
import Login from "./pages/Login";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import SkillMap from "./components/SkillMap";
import Dashboard from "./pages/Dashboard";
import Profile from "./components/dashboard/Profile";
import Latex from "./components/dashboard/Latex";
import Interview from "./components/dashboard/Interview";
import InterviewPrep from "./pages/InterviewPrep";
import Moat from "./pages/Moat";
import Tests from "./components/dashboard/Tests";
import { WishlistProvider } from "./contexts/WishlistContext";
import { Toaster } from "sonner";

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
      <WishlistProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={user ? <Dashboard user={user} /> : <Login />}
          />
          <Route path="/skillmap" element={<SkillMap />} />
          <Route path="/profile" element={user ? <Profile /> : <Login />} />
          <Route path="/latex" element={user ? <Latex /> : <Login />} />
          <Route path="/interview" element={user ? <Interview /> : <Login />} />
          <Route
            path="/interviewprep"
            element={user ? <InterviewPrep /> : <Login />}
          />
          <Route path="/moat" element={user ? <Moat /> : <Login />} />
          <Route path="/tests" element={user ? <Tests /> : <Login />} />
        </Routes>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "hsl(var(--background))",
              color: "hsl(var(--foreground))",
              border: "1px solid hsl(var(--border))",
            },
          }}
        />
      </WishlistProvider>
    </BrowserRouter>
  );
};

export default App;
