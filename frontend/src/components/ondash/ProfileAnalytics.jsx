import React, { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import {
  FiAward,
  FiLayers,
  FiBriefcase,
  FiBookOpen,
  FiHeart,
  FiMic,
  FiSmile,
  FiTrendingUp,
  FiActivity,
  FiCalendar,
  FiTarget,
  FiZap,
  FiStar,
  FiArrowUp,
  FiUsers,
} from "react-icons/fi";

const colors = {
  primary: "#2563eb",
  secondary: "#64748b", 
  success: "#059669",
  warning: "#d97706",
  error: "#dc2626",
  info: "#0891b2",
  purple: "#7c3aed",
  pink: "#db2777",
  indigo: "#4f46e5",
  teal: "#0d9488",
  orange: "#ea580c",
  emerald: "#059669",
};

const pastels = [
  "#e0e7ff", // indigo-100
  "#fce7f3", // pink-100
  "#dcfce7", // green-100
  "#fef3c7", // amber-100
  "#dbeafe", // blue-100
  "#f3e8ff", // violet-100
  "#ecfdf5", // emerald-100
  "#fef2f2", // red-100
];

const chartColors = [
  "#6366f1", // indigo-500
  "#ec4899", // pink-500
  "#10b981", // emerald-500
  "#f59e0b", // amber-500
  "#3b82f6", // blue-500
  "#8b5cf6", // violet-500
  "#06b6d4", // cyan-500
  "#ef4444", // red-500
];

const iconMap = {
  skills: { icon: <FiLayers className="w-5 h-5" />, color: colors.primary, bg: "#dbeafe" },
  certifications: { icon: <FiAward className="w-5 h-5" />, color: colors.purple, bg: "#f3e8ff" },
  jobsApplied: { icon: <FiBriefcase className="w-5 h-5" />, color: colors.success, bg: "#dcfce7" },
  learningPaths: { icon: <FiBookOpen className="w-5 h-5" />, color: colors.orange, bg: "#fed7aa" },
  wishlist: { icon: <FiHeart className="w-5 h-5" />, color: colors.pink, bg: "#fce7f3" },
  interviewPrep: { icon: <FiMic className="w-5 h-5" />, color: colors.indigo, bg: "#e0e7ff" },
  softskills: { icon: <FiSmile className="w-5 h-5" />, color: colors.teal, bg: "#ccfbf1" },
};

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 min-w-[180px]">
        <p className="font-semibold text-gray-900 mb-2 text-sm">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between gap-3 mb-1">
            <div className="flex items-center gap-2">
              <div 
                className="w-2.5 h-2.5 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-xs text-gray-600">{entry.dataKey}</span>
            </div>
            <span className="font-medium text-gray-900 text-xs">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const ProfileAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [pieData, setPieData] = useState([]);
  const [barData, setBarData] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [stats, setStats] = useState({});
  const [error, setError] = useState("");
  const [growthData, setGrowthData] = useState([]);
  const [radarData, setRadarData] = useState([]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/profile/analytics`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      if (data.success) {
        setPieData(data.data.pieData);
        setBarData(data.data.barData);
        setTimeline(data.data.timeline);
        setStats(data.data.stats);

        // Enhanced growth data
        setGrowthData([
          { month: "Jan", Skills: 2, Certifications: 0, Jobs: 1, Learning: 1 },
          { month: "Feb", Skills: 3, Certifications: 1, Jobs: 2, Learning: 2 },
          { month: "Mar", Skills: 5, Certifications: 1, Jobs: 3, Learning: 3 },
          { month: "Apr", Skills: 6, Certifications: 2, Jobs: 4, Learning: 4 },
          { month: "May", Skills: 7, Certifications: 2, Jobs: 5, Learning: 5 },
          { month: "Jun", Skills: stats.skillsCount || 8, Certifications: stats.certificationsCount || 3, Jobs: stats.jobsApplied || 6, Learning: stats.learningPaths || 4 },
        ]);

        // Enhanced radar data
        setRadarData([
          { subject: "Technical Skills", value: Math.min((stats.skillsCount || 0) * 2, 10), fullMark: 10 },
          { subject: "Certifications", value: Math.min((stats.certificationsCount || 0) * 3, 10), fullMark: 10 },
          { subject: "Soft Skills", value: Math.min((stats.softskillsCount || 0) * 2, 10), fullMark: 10 },
          { subject: "Learning Paths", value: Math.min((stats.learningPaths || 0) * 2.5, 10), fullMark: 10 },
          { subject: "Interview Prep", value: Math.min((stats.interviewPrep || 0) * 3, 10), fullMark: 10 },
          { subject: "Job Applications", value: Math.min((stats.jobsApplied || 0) * 1.5, 10), fullMark: 10 },
        ]);
      } else {
        setError(data.error || "Failed to fetch analytics");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-200 border-t-blue-600"></div>
          <p className="text-sm text-gray-500">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const statsCards = [
    { key: 'skills', label: 'Technical Skills', value: stats.skillsCount || 0, icon: 'skills', change: "+12%" },
    { key: 'certifications', label: 'Certifications', value: stats.certificationsCount || 0, icon: 'certifications', change: "+5%" },
    { key: 'jobs', label: 'Jobs Applied', value: stats.jobsApplied || 0, icon: 'jobsApplied', change: "+8%" },
    { key: 'wishlist', label: 'Wishlist Items', value: stats.wishlistCount || 0, icon: 'wishlist', change: "+3%" },
    { key: 'learning', label: 'Learning Paths', value: stats.learningPaths || 0, icon: 'learningPaths', change: "+15%" },
    { key: 'interview', label: 'Interview Prep', value: stats.interviewPrep || 0, icon: 'interviewPrep', change: "+7%" },
    { key: 'softskills', label: 'Soft Skills', value: stats.softskillsCount || 0, icon: 'softskills', change: "+4%" },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <FiTrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-sm text-gray-600">Track your career progress and achievements</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
          {statsCards.map((stat) => (
            <div key={stat.key} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200">
              <div className="flex flex-col items-center text-center space-y-3">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ 
                    backgroundColor: iconMap[stat.icon]?.bg,
                    color: iconMap[stat.icon]?.color 
                  }}
                >
                  {iconMap[stat.icon]?.icon}
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-xs text-gray-600 mb-1">{stat.label}</div>
                  <div className="flex items-center justify-center gap-1 text-xs text-green-600">
                    <FiArrowUp className="w-3 h-3" />
                    {stat.change}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Portfolio Distribution */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <FiTarget className="w-4 h-4 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Portfolio Distribution</h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={40}
                    paddingAngle={2}
                    strokeWidth={0}
                  >
                    {pieData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={chartColors[idx % chartColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Growth Trajectory */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <FiZap className="w-4 h-4 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Growth Trajectory</h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={growthData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fill: "#64748b", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fill: "#64748b", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="Skills" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ fill: "#3b82f6", strokeWidth: 0, r: 4 }}
                    activeDot={{ r: 5, stroke: "#3b82f6", strokeWidth: 2, fill: "#fff" }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="Certifications" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    dot={{ fill: "#8b5cf6", strokeWidth: 0, r: 4 }}
                    activeDot={{ r: 5, stroke: "#8b5cf6", strokeWidth: 2, fill: "#fff" }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="Jobs" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    dot={{ fill: "#10b981", strokeWidth: 0, r: 4 }}
                    activeDot={{ r: 5, stroke: "#10b981", strokeWidth: 2, fill: "#fff" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Secondary Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Skill Radar */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <FiActivity className="w-4 h-4 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Skill Assessment</h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                  <PolarGrid stroke="#f1f5f9" />
                  <PolarAngleAxis 
                    dataKey="subject" 
                    tick={{ fill: "#64748b", fontSize: 10 }}
                  />
                  <PolarRadiusAxis 
                    angle={90} 
                    domain={[0, 10]} 
                    tick={{ fill: "#94a3b8", fontSize: 9 }}
                    tickCount={6}
                    axisLine={false}
                  />
                  <Radar
                    name="Level"
                    dataKey="value"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.1}
                    strokeWidth={2}
                    dot={{ fill: "#3b82f6", strokeWidth: 0, r: 3 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Activity Summary */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-cyan-100 rounded-lg flex items-center justify-center">
                <FiBriefcase className="w-4 h-4 text-cyan-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Activity Summary</h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: "#64748b", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fill: "#64748b", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="Jobs Applied" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="Wishlist" fill="#8b5cf6" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="Certifications" fill="#10b981" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="Skills" fill="#f59e0b" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Career Timeline */}
        {timeline && timeline.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                <FiCalendar className="w-4 h-4 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Career Timeline</h3>
            </div>
            <div className="space-y-4">
              {timeline
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .slice(0, 8)
                .map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                    <div className="flex-shrink-0">
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: pastels[idx % pastels.length] }}
                      >
                        <FiStar className="w-4 h-4" style={{ color: chartColors[idx % chartColors.length] }} />
                      </div>
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          {item.type}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(item.date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-900">{item.label}</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="text-center">
              <div className="text-red-800 font-medium">{error}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileAnalytics;