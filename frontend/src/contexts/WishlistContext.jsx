import React, { createContext, useContext, useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../config/firebase";

const WishlistContext = createContext();

export const useWishlistContext = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error(
      "useWishlistContext must be used within a WishlistProvider"
    );
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const [wishlistJobIds, setWishlistJobIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser?.uid) {
        fetchWishlistIds(firebaseUser.uid);
      } else {
        setWishlistJobIds([]);
      }
    });

    return unsubscribe;
  }, []);

  const fetchWishlistIds = async (uid) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/jobs/wishlist/user/${uid}`
      );
      const data = await response.json();

      if (response.ok) {
        setWishlistJobIds(data.wishlist.map((job) => job._id));
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (jobId) => {
    if (!user?.uid) {
      return {
        success: false,
        message: "You must be logged in to add jobs to your wishlist",
      };
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/jobs/wishlist/${jobId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ firebaseUid: user.uid }),
        }
      );

      if (response.ok) {
        setWishlistJobIds((prev) => [...prev, jobId]);
        return { success: true, message: "Job added to wishlist" };
      } else {
        const data = await response.json();
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      return { success: false, message: "Failed to add to wishlist" };
    }
  };

  const removeFromWishlist = async (jobId) => {
    if (!user?.uid) {
      return { success: false, message: "You must be logged in" };
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/jobs/wishlist/${jobId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ firebaseUid: user.uid }),
        }
      );

      if (response.ok) {
        setWishlistJobIds((prev) => prev.filter((id) => id !== jobId));
        return { success: true, message: "Job removed from wishlist" };
      } else {
        const data = await response.json();
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      return { success: false, message: "Failed to remove from wishlist" };
    }
  };

  const toggleWishlist = async (jobId) => {
    if (wishlistJobIds.includes(jobId)) {
      return await removeFromWishlist(jobId);
    } else {
      return await addToWishlist(jobId);
    }
  };

  const isInWishlist = (jobId) => {
    return wishlistJobIds.includes(jobId);
  };

  const value = {
    wishlistJobIds,
    loading,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isInWishlist,
    refreshWishlist: () => user?.uid && fetchWishlistIds(user.uid),
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};
