import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  FiAward, FiCheckCircle, FiLock, FiUserCheck, FiFileText, FiPlusCircle, FiLayers,
  FiSend, FiBriefcase, FiHeart, FiMic, FiSmile, FiBookOpen, FiPhoneCall, FiStar
} from "react-icons/fi";

// Theme colors (matches your index.css and dashboard)
const unlockedBg = "bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/40";
const lockedBg = "bg-muted border-border/60 opacity-60";
const unlockedIcon = "border-primary bg-primary/10 text-primary";
const lockedIcon = "border-border bg-muted text-muted-foreground";

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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary/30 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading achievements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-3">
              <FiAward className="w-8 h-8 text-primary" />
              Achievements
            </h1>
            <p className="text-muted-foreground mt-2">
              Track your upskilling and job journey!
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-foreground">
              {summary.unlocked || 0}/{summary.total || 0}
            </div>
            <div className="text-sm text-muted-foreground">Achievements Unlocked</div>
            <Badge className="bg-primary/10 text-primary mt-2 border border-primary/30">
              {summary.percentage || 0}% Complete
            </Badge>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="bg-destructive/10 border-destructive/20 mb-6">
            <AlertDescription className="text-destructive">{error}</AlertDescription>
          </Alert>
        )}

        {/* Category Filters */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <motion.button
                key={category.id}
                onClick={() => setSelectedFilter(category.id)}
                className={`px-4 py-2 text-sm rounded-lg flex items-center gap-2 transition-all border font-medium ${
                  selectedFilter === category.id
                    ? "bg-primary text-primary-foreground border-primary shadow"
                    : "bg-card border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-lg">{category.icon}</span>
                {category.label}
                {category.id === "unlocked" && (
                  <Badge className="bg-green-100 text-green-700 text-xs border border-green-200 ml-1">
                    {achievements.filter((a) => a.unlocked).length}
                  </Badge>
                )}
                {category.id === "locked" && (
                  <Badge className="bg-red-100 text-red-700 text-xs border border-red-200 ml-1">
                    {achievements.filter((a) => !a.unlocked).length}
                  </Badge>
                )}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAchievements.map((a) => (
            <motion.div
              key={a.code}
              className={`rounded-xl border-2 p-6 flex flex-col items-center shadow transition-all duration-300 ${
                a.unlocked ? unlockedBg : lockedBg
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
            >
              <div className="mb-3">
                <span
                  className={`inline-block rounded-full p-3 border-2 ${
                    a.unlocked ? unlockedIcon : lockedIcon
                  }`}
                >
                  {iconMap[a.icon] || <FiAward className="w-8 h-8" />}
                </span>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <span className="font-bold text-lg">{a.title}</span>
                  {a.rarity === "rare" && (
                    <Badge className="bg-purple-100 text-purple-700 text-xs border border-purple-200">
                      Rare
                    </Badge>
                  )}
                  {a.rarity === "legendary" && (
                    <Badge className="bg-orange-100 text-orange-700 text-xs border border-orange-200">
                      Legendary
                    </Badge>
                  )}
                </div>
                <div className="text-muted-foreground text-sm mb-2">{a.description}</div>
                <div className="flex flex-wrap gap-2 justify-center mb-2">
                  <Badge
                    className={`text-xs ${
                      a.unlocked
                        ? "bg-green-100 text-green-700 border-green-200"
                        : "bg-muted text-muted-foreground border-border"
                    }`}
                  >
                    {a.unlocked ? "Unlocked" : "Locked"}
                  </Badge>
                  <Badge className="bg-muted text-muted-foreground border-border text-xs capitalize">
                    {a.category}
                  </Badge>
                </div>
                {a.unlocked && a.unlockedAt && (
                  <div className="text-xs text-green-600 mt-1">
                    Unlocked on {new Date(a.unlockedAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {filteredAchievements.length === 0 && (
          <div className="text-center py-12">
            <FiAward className="text-6xl mb-4 text-primary mx-auto" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No achievements found
            </h3>
            <p className="text-muted-foreground">
              Try selecting a different category or start upskilling!
            </p>
          </div>
        )}
      </div>
    </div>
    );
};

export default Achievements;