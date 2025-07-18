import React, { useState, useEffect } from 'react';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        fetchProfile(firebaseUser);
        verifyToken(firebaseUser);
      }
    });

    return unsubscribe;
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Firebase onAuthStateChanged will handle the state update automatically
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const fetchProfile = async (currentUser) => {
    setLoading(true);
    try {
      const token = await currentUser.getIdToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setUserProfile(data.user);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
    setLoading(false);
  };

  const verifyToken = async (currentUser) => {
    try {
      const token = await currentUser.getIdToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      console.log('Token verification:', data);
    } catch (error) {
      console.error('Token verification error:', error);
    }
  };

  const refreshProfile = () => {
    if (user) {
      fetchProfile(user);
    }
  };

  const copyToken = async () => {
    if (user) {
      try {
        const token = await user.getIdToken();
        await navigator.clipboard.writeText(token);
        alert('Token copied to clipboard!');
      } catch (error) {
        console.error('Error copying token:', error);
      }
    }
  };

  if (!user) {
    return <div>Loading user...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Logout
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Firebase User Info</h2>
              <div className="space-y-2">
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>UID:</strong> {user.uid}</p>
                <p><strong>Display Name:</strong> {user.displayName || 'Not set'}</p>
                <p><strong>Email Verified:</strong> {user.emailVerified ? 'Yes' : 'No'}</p>
                <p><strong>Provider:</strong> {user.providerData?.[0]?.providerId}</p>
                {user.photoURL && (
                  <div>
                    <strong>Profile Picture:</strong>
                    <img 
                      src={user.photoURL} 
                      alt="Profile" 
                      className="w-16 h-16 rounded-full mt-2"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Backend Profile</h2>
              {loading ? (
                <p>Loading...</p>
              ) : userProfile ? (
                <div className="space-y-2">
                  <p><strong>Name:</strong> {userProfile.name || 'Not set'}</p>
                  <p><strong>Email:</strong> {userProfile.email}</p>
                  <p><strong>UID:</strong> {userProfile.uid}</p>
                  <p><strong>Picture:</strong> {userProfile.picture ? 'Yes' : 'No'}</p>
                </div>
              ) : (
                <p>No profile data from backend</p>
              )}
              
              <button
                onClick={refreshProfile}
                disabled={loading}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Refresh Profile'}
              </button>
            </div>
          </div>

          <div className="mt-6 bg-yellow-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Actions</h3>
            <div className="space-x-2">
              <button
                onClick={() => verifyToken(user)}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Verify Token
              </button>
              
              <button
                onClick={copyToken}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                Copy Token
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;