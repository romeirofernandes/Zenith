import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Legend,
  AreaChart,
  Area,
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
} from "react-icons/fi";

const pastelColors = [
  "#A5D8FF", // blue
  "#FFD6A5", // orange
  "#B5EAD7", // green
  "#FFB7B2", // pink
  "#E2F0CB", // light green
  "#C7CEEA", // purple
  "#FFFACD", // yellow
  "#F3C6E8", // lavender
];

const iconMap = {
  skills: <FiLayers className="w-6 h-6 text-primary" />,
  certifications: <FiAward className="w-6 h-6 text-primary" />,
  jobsApplied: <FiBriefcase className="w-6 h-6 text-primary" />,
  learningPaths: <FiBookOpen className="w-6 h-6 text-primary" />,
  wishlist: <FiHeart className="w-6 h-6 text-primary" />,
  interviewPrep: <FiMic className="w-6 h-6 text-primary" />,
  softskills: <FiSmile className="w-6 h-6 text-primary" />,
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
    // eslint-disable-next-line
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

        // Fake growth data for demo (replace with real backend data if available)
        setGrowthData([
          { month: "Jan", Skills: 2, Certifications: 0, Jobs: 1 },
          { month: "Feb", Skills: 3, Certifications: 1, Jobs: 2 },
          { month: "Mar", Skills: 5, Certifications: 1, Jobs: 3 },
          { month: "Apr", Skills: 6, Certifications: 2, Jobs: 4 },
          { month: "May", Skills: 7, Certifications: 2, Jobs: 5 },
          { month: "Jun", Skills: stats.skillsCount, Certifications: stats.certificationsCount, Jobs: stats.jobsApplied },
        ]);

        // Radar data for skill balance (fake, replace with real if available)
        setRadarData([
          { subject: "Tech", A: stats.skillsCount, fullMark: 10 },
          { subject: "Certs", A: stats.certificationsCount, fullMark: 10 },
          { subject: "Soft Skills", A: stats.softskillsCount, fullMark: 10 },
          { subject: "Learning", A: stats.learningPaths, fullMark: 10 },
          { subject: "Interview", A: stats.interviewPrep, fullMark: 10 },
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
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Big Header */}
      <div className="mb-6">
        <h1 className="text-4xl md:text-5xl font-extrabold flex items-center gap-3 text-primary">
          <FiTrendingUp className="w-10 h-10" />
          Analytics
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Visualize your upskilling and job journey with beautiful insights.
        </p>
      </div>

      {/* Stats Badges (removed small buttons, just badges) */}
      <div className="flex flex-wrap gap-4 justify-center md:justify-start">
        <Badge className="bg-primary/10 text-primary border border-primary/20 flex items-center gap-2 text-base px-4 py-2">
          <FiLayers /> Skills: <span className="font-bold">{stats.skillsCount}</span>
        </Badge>
        <Badge className="bg-purple-100 text-purple-700 border border-purple-200 flex items-center gap-2 text-base px-4 py-2">
          <FiAward /> Certifications: <span className="font-bold">{stats.certificationsCount}</span>
        </Badge>
        <Badge className="bg-blue-100 text-blue-700 border border-blue-200 flex items-center gap-2 text-base px-4 py-2">
          <FiBriefcase /> Jobs Applied: <span className="font-bold">{stats.jobsApplied}</span>
        </Badge>
        <Badge className="bg-pink-100 text-pink-700 border border-pink-200 flex items-center gap-2 text-base px-4 py-2">
          <FiHeart /> Wishlist: <span className="font-bold">{stats.wishlistCount}</span>
        </Badge>
        <Badge className="bg-green-100 text-green-700 border border-green-200 flex items-center gap-2 text-base px-4 py-2">
          <FiBookOpen /> Learning Paths: <span className="font-bold">{stats.learningPaths}</span>
        </Badge>
        <Badge className="bg-yellow-100 text-yellow-700 border border-yellow-200 flex items-center gap-2 text-base px-4 py-2">
          <FiMic /> Interview Prep: <span className="font-bold">{stats.interviewPrep}</span>
        </Badge>
        <Badge className="bg-indigo-100 text-indigo-700 border border-indigo-200 flex items-center gap-2 text-base px-4 py-2">
          <FiSmile /> Soft Skills: <span className="font-bold">{stats.softskillsCount}</span>
        </Badge>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Pie Chart Card */}
        <Card className="bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FiAward className="w-5 h-5 text-primary" />
              Your Upskilling Mix
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-full md:w-64 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      innerRadius={50}
                      paddingAngle={3}
                      label={({ name, percent }) =>
                        `${name} (${Math.round(percent * 100)}%)`
                      }
                    >
                      {pieData.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={pastelColors[idx % pastelColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col gap-3">
                {pieData.map((item, idx) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <span
                      className="inline-block w-4 h-4 rounded-full"
                      style={{ background: pastelColors[idx % pastelColors.length] }}
                    ></span>
                    <span className="font-medium">{item.name}</span>
                    <Badge variant="secondary">{item.value}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bar Chart Card */}
        <Card className="bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FiBriefcase className="w-5 h-5 text-primary" />
              Job Activity Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="name" tick={{ fill: "var(--foreground)" }} />
                  <YAxis tick={{ fill: "var(--foreground)" }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Jobs Applied" fill="#A5D8FF" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="Wishlist" fill="#FFD6A5" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="Certifications" fill="#B5EAD7" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="Skills" fill="#FFB7B2" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Growth Over Time (Line/Area Chart) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FiTrendingUp className="w-5 h-5 text-primary" />
              Growth Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={growthData}>
                  <defs>
                    <linearGradient id="colorSkills" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#A5D8FF" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#A5D8FF" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" tick={{ fill: "var(--foreground)" }} />
                  <YAxis tick={{ fill: "var(--foreground)" }} />
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <Tooltip />
                  <Area type="monotone" dataKey="Skills" stroke="#A5D8FF" fillOpacity={1} fill="url(#colorSkills)" />
                  <Area type="monotone" dataKey="Certifications" stroke="#B5EAD7" fill="#B5EAD7" fillOpacity={0.3} />
                  <Area type="monotone" dataKey="Jobs" stroke="#FFD6A5" fill="#FFD6A5" fillOpacity={0.2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Radar Chart for Skill Balance */}
        <Card className="bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FiActivity className="w-5 h-5 text-primary" />
              Skill Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: "var(--foreground)" }} />
                  <PolarRadiusAxis angle={30} domain={[0, 10]} />
                  <Radar
                    name="You"
                    dataKey="A"
                    stroke="#A5D8FF"
                    fill="#A5D8FF"
                    fillOpacity={0.5}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline (optional, pastel badges) */}
      {timeline && timeline.length > 0 && (
        <Card className="bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FiCalendar className="w-5 h-5 text-primary" />
              Your Upskilling Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              {timeline
                .sort((a, b) => new Date(a.date) - new Date(b.date))
                .map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <Badge
                      className="text-xs"
                      style={{
                        background: pastelColors[idx % pastelColors.length],
                        color: "#333",
                        border: "none",
                      }}
                    >
                      {item.type}
                    </Badge>
                    <span className="font-medium">{item.label}</span>
                    <span className="text-muted-foreground text-xs">
                      {new Date(item.date).toLocaleDateString()}
                    </span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <div className="text-center text-destructive font-semibold">{error}</div>
      )}
      </div>
  );
};

export default ProfileAnalytics;