import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  FiAward, FiCheckCircle, FiLock, FiUserCheck, FiFileText, FiPlusCircle, FiLayers,
  FiSend, FiBriefcase, FiHeart, FiMic, FiSmile, FiBookOpen, FiPhoneCall, FiStar
} from "react-icons/fi";

const iconMap = {
  FiAward: <FiAward className="w-8 h-8" />,
  FiUserCheck: <FiUserCheck className="w-8 h-8" />,
  FiFileText: <FiFileText className="w-8 h-8" />,
  FiPlusCircle: <FiPlusCircle className="w-8 h-8" />,
  FiLayers: <FiLayers className="w-8 h-8" />,
  FiSend: <FiSend className="w-8 h-8" />,
  FiBriefcase: <FiBriefcase className="w-8 h-8" />,
  FiHeart: <FiHeart className="w-8 h-8" />,
  FiMic: <FiMic className="w-8 h-8" />,
  FiSmile: <FiSmile className="w-8 h-8" />,
  FiBookOpen: <FiBookOpen className="w-8 h-8" />,
  FiPhoneCall: <FiPhoneCall className="w-8 h-8" />,
  FiStar: <FiStar className="w-8 h-8" />,
};

const categories = [
  { id: "all", label: "All", icon: <FiAward /> },
  { id: "unlocked", label: "Unlocked", icon: <FiCheckCircle /> },
  { id: "locked", label: "Locked", icon: <FiLock /> },
  { id: "profile", label: "Profile", icon: <FiUserCheck /> },
  { id: "skills", label: "Skills", icon: <FiLayers /> },
  { id: "certification", label: "Certification", icon: <FiAward /> },
  { id: "applications", label: "Applications", icon: <FiBriefcase /> },
  { id: "wishlist", label: "Wishlist", icon: <FiHeart /> },
  { id: "interview", label: "Interview", icon: <FiMic /> },
  { id: "learning", label: "Learning", icon: <FiBookOpen /> },
  { id: "milestone", label: "Milestone", icon: <FiStar /> },
];

const Achievements = () => {
  const [loading, setLoading] = useState(true);
  const [achievements, setAchievements] = useState([]);
  const [stats, setStats] = useState({});
  const [summary, setSummary] = useState({});
  const [error, setError] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/achievements`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await response.json();
      if (data.success) {
        setAchievements(data.data.achievements);
        setStats(data.data.stats);
        setSummary(data.data.summary);
      } else {
        setError(data.error || "Failed to fetch achievements");
      }
    } catch (error) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filteredAchievements =
    selectedFilter === "all"
      ? achievements
      : selectedFilter === "unlocked"
      ? achievements.filter((a) => a.unlocked)
      : selectedFilter === "locked"
      ? achievements.filter((a) => !a.unlocked)
      : achievements.filter((a) => a.category === selectedFilter);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white/20 mx-auto mb-4"></div>
          <p className="text-white/70">Loading achievements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-3">
              <FiAward className="w-8 h-8 text-yellow-400" />
              Achievements
            </h1>
            <p className="text-white/70 mt-2">
              Track your upskilling and job journey!
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-white">
              {summary.unlocked || 0}/{summary.total || 0}
            </div>
            <div className="text-sm text-white/70">Achievements Unlocked</div>
            <Badge className="bg-yellow-900/70 text-yellow-200 mt-2 border border-yellow-700">
              {summary.percentage || 0}% Complete
            </Badge>
          </div>
        </div>

        {error && (
          <Alert className="bg-red-500/10 border-red-500/20 mb-6">
            <AlertDescription className="text-red-200">{error}</AlertDescription>
          </Alert>
        )}

        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <motion.button
                key={category.id}
                onClick={() => setSelectedFilter(category.id)}
                className={`px-4 py-2 text-sm rounded-lg flex items-center gap-2 transition-all border ${
                  selectedFilter === category.id
                    ? "bg-white text-zinc-950 border-white shadow"
                    : "bg-zinc-900 border-zinc-800 text-white/70 hover:bg-zinc-800 hover:text-white"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-lg">{category.icon}</span>
                {category.label}
                {category.id === "unlocked" && (
                  <Badge className="bg-green-600 text-white text-xs border border-green-700 ml-1">
                    {achievements.filter((a) => a.unlocked).length}
                  </Badge>
                )}
                {category.id === "locked" && (
                  <Badge className="bg-red-600 text-white text-xs border border-red-700 ml-1">
                    {achievements.filter((a) => !a.unlocked).length}
                  </Badge>
                )}
              </motion.button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAchievements.map((a) => (
            <motion.div
              key={a.code}
              className={`rounded-xl border-2 p-6 flex flex-col items-center shadow transition-all duration-300 ${
                a.unlocked
                  ? "border-yellow-400 bg-gradient-to-br from-yellow-900/50 to-zinc-900"
                  : "border-zinc-800 bg-zinc-900 opacity-60"
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
            >
              <div className="mb-3">
                <span
                  className={`inline-block rounded-full p-3 border-2 ${
                    a.unlocked
                      ? "border-yellow-400 bg-yellow-900/30"
                      : "border-zinc-800 bg-zinc-800"
                  }`}
                >
                  {iconMap[a.icon] || <FiAward className="w-8 h-8" />}
                </span>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <span className="font-bold text-lg">{a.title}</span>
                  {a.rarity === "rare" && (
                    <Badge className="bg-purple-700 text-white text-xs border border-purple-900">
                      Rare
                    </Badge>
                  )}
                  {a.rarity === "legendary" && (
                    <Badge className="bg-orange-700 text-white text-xs border border-orange-900">
                      Legendary
                    </Badge>
                  )}
                </div>
                <div className="text-white/80 text-sm mb-2">{a.description}</div>
                <div className="flex flex-wrap gap-2 justify-center mb-2">
                  <Badge
                    className={`text-xs ${
                      a.unlocked
                        ? "bg-green-600 border-green-700"
                        : "bg-zinc-700 border-zinc-800"
                    }`}
                  >
                    {a.unlocked ? "Unlocked" : "Locked"}
                  </Badge>
                  <Badge className="bg-zinc-800 border-zinc-700 text-xs capitalize">
                    {a.category}
                  </Badge>
                </div>
                {a.unlocked && a.unlockedAt && (
                  <div className="text-xs text-green-400 mt-1">
                    Unlocked on {new Date(a.unlockedAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {filteredAchievements.length === 0 && (
          <div className="text-center py-12">
            <FiAward className="text-6xl mb-4 text-yellow-400 mx-auto" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No achievements found
            </h3>
            <p className="text-white/60">
              Try selecting a different category or start upskilling!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Achievements;