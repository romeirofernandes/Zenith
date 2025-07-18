import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "../config/firebase";
import { useNavigate } from "react-router-dom";
import {
  FaUser,
  FaFileAlt,
  FaComments,
  FaSignOutAlt,
  FaBars,
  FaTimes,
} from "react-icons/fa";

const sidebarItems = [
  { id: "profile", label: "Profile", icon: FaUser },
  { id: "latex", label: "Latex", icon: FaFileAlt },
  { id: "interview", label: "Interview", icon: FaComments },
];

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

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
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const fetchProfile = async (currentUser) => {
    setLoading(true);
    try {
      const token = await currentUser.getIdToken();
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/profile`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        setUserProfile(data.user);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
    setLoading(false);
  };

  const verifyToken = async (currentUser) => {
    try {
      const token = await currentUser.getIdToken();
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/verify`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      console.log("Token verification:", data);
    } catch (error) {
      console.error("Token verification error:", error);
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
        alert("Token copied to clipboard!");
      } catch (error) {
        console.error("Error copying token:", error);
      }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.22, ease: "easeOut" },
    },
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground text-xl">Loading user...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Mobile Navbar */}
      <div className="lg:hidden bg-background border-b border-border/50 p-4">
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-blue-700 font-sans">
            SOS Dashboard
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <FaBars className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="flex">
        {/* Desktop Sidebar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.18, ease: "linear" }}
          className="hidden lg:flex w-64 bg-gradient-to-b from-blue-900 via-blue-700 to-blue-500 text-white rounded-xl shadow-lg h-[95vh] sticky top-[2vh] flex-col z-30 m-4 ml-4"
        >
          <div className="p-6 border-b border-blue-800">
            <div className="text-2xl font-bold text-white font-sans mb-4">
              SOS Dashboard
            </div>
            <div className="flex items-center space-x-3">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="Profile"
                  className="h-12 w-12 rounded-full"
                />
              ) : (
                <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center text-xl font-bold">
                  {user.displayName?.[0] || user.email?.[0] || "U"}
                </div>
              )}
              <div>
                <p className="text-sm font-medium truncate">{user.displayName || "User"}</p>
                <p className="text-xs text-blue-200 truncate">{user.email}</p>
              </div>
            </div>
          </div>
          <div className="p-4 flex-1">
            <nav className="space-y-2">
              {sidebarItems.map((item) => (
                <motion.button
                  key={item.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-150 ${
                    activeTab === item.id
                      ? "bg-white text-blue-700 shadow-md"
                      : "text-blue-100 hover:text-white hover:bg-blue-800"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </motion.button>
              ))}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-red-200 hover:text-red-600 hover:bg-red-50 transition-all duration-150 mt-4"
              >
                <FaSignOutAlt className="h-5 w-5" />
                <span>Logout</span>
              </motion.button>
            </nav>
          </div>
        </motion.div>

        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="lg:hidden fixed inset-0 bg-black/50 z-40"
                onClick={() => setIsMobileMenuOpen(false)}
              />
              <motion.div
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="lg:hidden fixed left-4 top-4 bottom-4 w-64 bg-gradient-to-b from-blue-900 via-blue-700 to-blue-500 text-white rounded-xl shadow-xl z-50 flex flex-col"
              >
                <div className="p-6 border-b border-blue-800">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-2xl font-bold text-white font-sans">
                      SOS Dashboard
                    </div>
                    <button
                      className="text-white"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <FaTimes className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex items-center space-x-3">
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt="Profile"
                        className="h-12 w-12 rounded-full"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center text-xl font-bold">
                        {user.displayName?.[0] || user.email?.[0] || "U"}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium truncate">{user.displayName || "User"}</p>
                      <p className="text-xs text-blue-200 truncate">{user.email}</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 flex-1">
                  <nav className="space-y-2">
                    {sidebarItems.map((item) => (
                      <motion.button
                        key={item.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setActiveTab(item.id);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-150 ${
                          activeTab === item.id
                            ? "bg-white text-blue-700 shadow-md"
                            : "text-blue-100 hover:text-white hover:bg-blue-800"
                        }`}
                      >
                        <item.icon className="h-5 w-5" />
                        <span>{item.label}</span>
                      </motion.button>
                    ))}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-red-200 hover:text-red-600 hover:bg-red-50 transition-all duration-150 mt-4"
                    >
                      <FaSignOutAlt className="h-5 w-5" />
                      <span>Logout</span>
                    </motion.button>
                  </nav>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="flex-1 p-6">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="space-y-6 max-w-7xl mx-auto"
          >
            {/* Tab Content */}
            {activeTab === "profile" && (
              <motion.div variants={itemVariants}>
                {/* Previous dashboard content */}
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
                          {loading ? "Loading..." : "Refresh Profile"}
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
              </motion.div>
            )}
            {activeTab === "latex" && (
              <motion.div variants={itemVariants}>
                <div className="p-8 text-2xl">Latex</div>
              </motion.div>
            )}
            {activeTab === "interview" && (
              <motion.div variants={itemVariants}>
                <div className="p-8 text-2xl">Interview</div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

// Helper Button component for mobile nav
function Button({ children, ...props }) {
  return (
    <button
      {...props}
      className={`px-2 py-1 rounded hover:bg-blue-100 transition ${props.className || ""}`}
    >
      {children}
    </button>
  );
}

export default Dashboard;