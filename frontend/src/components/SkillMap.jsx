import React, { useState } from "react";
import { MapContainer, TileLayer, GeoJSON, Marker, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import {
  FiTrendingUp, FiStar, FiX, FiUsers, FiDollarSign, FiArrowUp, FiMapPin
} from "react-icons/fi";
import {
  HiOutlineGlobeAlt, HiOutlineCode, HiOutlineTrendingUp
} from "react-icons/hi";
import { BiWorld, BiTrendingUp } from "react-icons/bi";
import {
  SiReact, SiJavascript, SiPython, SiTypescript, SiRust, SiGo
} from "react-icons/si";
import customGeo from "../../src/custom.geo.json";

// --- DATA ---
const stackOverflowData = {
  'United States': {
    region: 'North America',
    flag: '🇺🇸',
    population: '334M',
    developers: '4.2M',
    avgSalary: '$125,000',
    color: '#FFB3BA',
    coordinates: [37.0902, -95.7129],
    topSkills: [
      { name: 'JavaScript', percentage: 63.61, growth: '+2.1%', salary: '$115k', icon: SiJavascript, color: '#F7DF1E' },
      { name: 'Python', percentage: 49.28, growth: '+4.2%', salary: '$125k', icon: SiPython, color: '#3776AB' },
      { name: 'TypeScript', percentage: 38.87, growth: '+6.8%', salary: '$135k', icon: SiTypescript, color: '#3178C6' },
      { name: 'React', percentage: 40.58, growth: '+3.5%', salary: '$130k', icon: SiReact, color: '#61DAFB' },
      { name: 'Rust', percentage: 13.05, growth: '+12.3%', salary: '$155k', icon: SiRust, color: '#000000' }
    ],
    futureJobs: [
      { role: 'AI and Machine Learning Engineers', growth: '+40%', demand: 'Very High', avg_salary: '$165k' },
      { role: 'Data Scientists and Analysts', growth: '+35%', demand: 'High', avg_salary: '$140k' },
      { role: 'Cybersecurity Engineers', growth: '+28%', demand: 'Very High', avg_salary: '$155k' },
      { role: 'Software and Applications Developers', growth: '+25%', demand: 'High', avg_salary: '$125k' },
      { role: 'Cloud Computing Specialists', growth: '+30%', demand: 'Very High', avg_salary: '$145k' }
    ],
    techTrends: [
      { trend: 'AI/ML Integration', adoption: 78, impact: 'High' },
      { trend: 'Cloud-Native Development', adoption: 85, impact: 'Very High' },
      { trend: 'WebAssembly', adoption: 23, impact: 'Growing' }
    ],
    learningPaths: [
      { platform: 'Coursera', course: 'Google AI Certificate', rating: 4.8, students: '2.3M', price: '$49/month', duration: '6 months' },
      { platform: 'Udacity', course: 'React Nanodegree', rating: 4.7, students: '850k', price: '$399/month', duration: '4 months' }
    ],
    jobMarket: {
      openings: '2.1M',
      growth: '+15%',
      competitiveness: 'High',
      remoteRatio: '68%'
    }
  },
  'Germany': {
    region: 'Europe',
    flag: '🇩🇪',
    population: '83M',
    developers: '950k',
    avgSalary: '€75,000',
    color: '#BAFFC9',
    coordinates: [51.1657, 10.4515],
    topSkills: [
      { name: 'JavaScript', percentage: 61.45, growth: '+1.8%', salary: '€68k', icon: SiJavascript, color: '#F7DF1E' },
      { name: 'Python', percentage: 45.32, growth: '+5.1%', salary: '€78k', icon: SiPython, color: '#3776AB' },
      { name: 'TypeScript', percentage: 42.18, growth: '+8.2%', salary: '€82k', icon: SiTypescript, color: '#3178C6' },
      { name: 'Go', percentage: 15.87, growth: '+9.4%', salary: '€85k', icon: SiGo, color: '#00ADD8' },
      { name: 'Rust', percentage: 18.92, growth: '+15.7%', salary: '€95k', icon: SiRust, color: '#000000' }
    ],
    futureJobs: [
      { role: 'Renewable Energy Engineers', growth: '+45%', demand: 'Very High', avg_salary: '€85k' },
      { role: 'Industrial IoT Specialists', growth: '+38%', demand: 'High', avg_salary: '€78k' },
      { role: 'Robotics Engineers', growth: '+32%', demand: 'High', avg_salary: '€92k' },
      { role: 'Sustainability Specialists', growth: '+35%', demand: 'Growing', avg_salary: '€70k' },
      { role: 'Data Scientists', growth: '+30%', demand: 'High', avg_salary: '€82k' }
    ],
    techTrends: [
      { trend: 'Industry 4.0', adoption: 82, impact: 'Very High' },
      { trend: 'Green Computing', adoption: 71, impact: 'High' },
      { trend: 'Automotive Tech', adoption: 65, impact: 'High' }
    ],
    learningPaths: [
      { platform: 'edX', course: 'MIT Full Stack', rating: 4.9, students: '1.8M', price: '€299', duration: '8 months' },
      { platform: 'Codecademy', course: 'Advanced JavaScript', rating: 4.5, students: '920k', price: '€25/month', duration: '3 months' }
    ],
    jobMarket: {
      openings: '450k',
      growth: '+12%',
      competitiveness: 'Medium',
      remoteRatio: '45%'
    }
  },
  'India': {
    region: 'Asia',
    flag: '🇮🇳',
    population: '1.4B',
    developers: '5.8M',
    avgSalary: '₹12,50,000',
    color: '#FFFFBA',
    coordinates: [20.5937, 78.9629],
    topSkills: [
      { name: 'JavaScript', percentage: 65.82, growth: '+3.2%', salary: '₹15L', icon: SiJavascript, color: '#F7DF1E' },
      { name: 'Python', percentage: 52.65, growth: '+6.8%', salary: '₹18L', icon: SiPython, color: '#3776AB' },
      { name: 'React', percentage: 47.13, growth: '+8.5%', salary: '₹16L', icon: SiReact, color: '#61DAFB' },
      { name: 'TypeScript', percentage: 35.29, growth: '+11.2%', salary: '₹19L', icon: SiTypescript, color: '#3178C6' },
      { name: 'Go', percentage: 12.74, growth: '+18.9%', salary: '₹22L', icon: SiGo, color: '#00ADD8' }
    ],
    futureJobs: [
      { role: 'Digital Banking Specialists', growth: '+55%', demand: 'Very High', avg_salary: '₹25L' },
      { role: 'Mobile App Developers', growth: '+42%', demand: 'Very High', avg_salary: '₹18L' },
      { role: 'EdTech Platform Engineers', growth: '+48%', demand: 'High', avg_salary: '₹22L' },
      { role: 'E-commerce Specialists', growth: '+38%', demand: 'High', avg_salary: '₹20L' },
      { role: 'Digital Marketing Technologists', growth: '+35%', demand: 'Growing', avg_salary: '₹16L' }
    ],
    techTrends: [
      { trend: 'Mobile-First Development', adoption: 89, impact: 'Very High' },
      { trend: 'Fintech Innovation', adoption: 76, impact: 'High' },
      { trend: 'EdTech Solutions', adoption: 68, impact: 'Growing' }
    ],
    learningPaths: [
      { platform: 'Unacademy', course: 'Full Stack Development', rating: 4.6, students: '3.2M', price: '₹999/month', duration: '6 months' },
      { platform: 'Scaler', course: 'Software Engineering', rating: 4.8, students: '650k', price: '₹2999/month', duration: '12 months' }
    ],
    jobMarket: {
      openings: '3.2M',
      growth: '+25%',
      competitiveness: 'Very High',
      remoteRatio: '52%'
    }
  },
  'United Kingdom': {
    region: 'Europe',
    flag: '🇬🇧',
    population: '67M',
    developers: '1.1M',
    avgSalary: '£65,000',
    color: '#BAFFC9',
    coordinates: [55.3781, -3.4360],
    topSkills: [
      { name: 'JavaScript', percentage: 62.34, growth: '+2.3%', salary: '£58k', icon: SiJavascript, color: '#F7DF1E' },
      { name: 'Python', percentage: 46.85, growth: '+4.7%', salary: '£68k', icon: SiPython, color: '#3776AB' },
      { name: 'TypeScript', percentage: 41.92, growth: '+7.1%', salary: '£72k', icon: SiTypescript, color: '#3178C6' },
      { name: 'React', percentage: 38.76, growth: '+3.8%', salary: '£70k', icon: SiReact, color: '#61DAFB' },
      { name: 'Rust', percentage: 16.43, growth: '+13.2%', salary: '£85k', icon: SiRust, color: '#000000' }
    ],
    futureJobs: [
      { role: 'Financial Technology Engineers', growth: '+50%', demand: 'Very High', avg_salary: '£95k' },
      { role: 'RegTech Specialists', growth: '+40%', demand: 'High', avg_salary: '£85k' },
      { role: 'Climate Tech Developers', growth: '+38%', demand: 'Growing', avg_salary: '£75k' },
      { role: 'Digital Health Engineers', growth: '+35%', demand: 'High', avg_salary: '£78k' },
      { role: 'Blockchain Developers', growth: '+32%', demand: 'Growing', avg_salary: '£88k' }
    ],
    techTrends: [
      { trend: 'Fintech Innovation', adoption: 84, impact: 'Very High' },
      { trend: 'Regulatory Tech', adoption: 67, impact: 'High' },
      { trend: 'Green Tech', adoption: 59, impact: 'Growing' }
    ],
    learningPaths: [
      { platform: 'FutureLearn', course: 'Digital Skills', rating: 4.6, students: '1.5M', price: '£39/month', duration: '4 months' },
      { platform: 'Codecademy', course: 'Web Development', rating: 4.4, students: '780k', price: '£25/month', duration: '5 months' }
    ],
    jobMarket: {
      openings: '380k',
      growth: '+18%',
      competitiveness: 'High',
      remoteRatio: '71%'
    }
  },
  'Canada': {
    region: 'North America',
    flag: '🇨🇦',
    population: '39M',
    developers: '650k',
    avgSalary: 'CAD $95,000',
    color: '#FFB3BA',
    coordinates: [56.1304, -106.3468],
    topSkills: [
      { name: 'JavaScript', percentage: 64.12, growth: '+2.5%', salary: 'CAD $88k', icon: SiJavascript, color: '#F7DF1E' },
      { name: 'Python', percentage: 48.73, growth: '+5.3%', salary: 'CAD $98k', icon: SiPython, color: '#3776AB' },
      { name: 'TypeScript', percentage: 39.84, growth: '+6.9%', salary: 'CAD $105k', icon: SiTypescript, color: '#3178C6' },
      { name: 'React', percentage: 41.25, growth: '+4.1%', salary: 'CAD $102k', icon: SiReact, color: '#61DAFB' },
      { name: 'Go', percentage: 14.67, growth: '+11.8%', salary: 'CAD $115k', icon: SiGo, color: '#00ADD8' }
    ],
    futureJobs: [
      { role: 'AI Research Scientists', growth: '+45%', demand: 'Very High', avg_salary: 'CAD $145k' },
      { role: 'Clean Energy Engineers', growth: '+42%', demand: 'High', avg_salary: 'CAD $125k' },
      { role: 'Healthcare Technology Specialists', growth: '+38%', demand: 'High', avg_salary: 'CAD $115k' },
      { role: 'Quantum Computing Engineers', growth: '+35%', demand: 'Growing', avg_salary: 'CAD $155k' },
      { role: 'Arctic Technology Specialists', growth: '+30%', demand: 'Growing', avg_salary: 'CAD $135k' }
    ],
    techTrends: [
      { trend: 'AI Research', adoption: 75, impact: 'Very High' },
      { trend: 'Clean Energy Tech', adoption: 68, impact: 'High' },
      { trend: 'Healthcare Tech', adoption: 62, impact: 'Growing' }
    ],
    learningPaths: [
      { platform: 'Coursera', course: 'University of Toronto AI', rating: 4.7, students: '890k', price: 'CAD $65/month', duration: '7 months' },
      { platform: 'Udemy', course: 'Full Stack Web Dev', rating: 4.5, students: '1.2M', price: 'CAD $199', duration: '6 months' }
    ],
    jobMarket: {
      openings: '285k',
      growth: '+20%',
      competitiveness: 'Medium',
      remoteRatio: '63%'
    }
  },
  'Australia': {
    region: 'Oceania',
    flag: '🇦🇺',
    population: '26M',
    developers: '280k',
    avgSalary: 'AUD $95,000',
    color: '#BAE1FF',
    coordinates: [-25.2744, 133.7751],
    topSkills: [
      { name: 'JavaScript', percentage: 63.47, growth: '+1.9%', salary: 'AUD $85k', icon: SiJavascript, color: '#F7DF1E' },
      { name: 'Python', percentage: 47.92, growth: '+4.8%', salary: 'AUD $98k', icon: SiPython, color: '#3776AB' },
      { name: 'TypeScript', percentage: 38.15, growth: '+6.3%', salary: 'AUD $102k', icon: SiTypescript, color: '#3178C6' },
      { name: 'React', percentage: 39.68, growth: '+3.2%', salary: 'AUD $95k', icon: SiReact, color: '#61DAFB' },
      { name: 'Rust', percentage: 15.23, growth: '+12.7%', salary: 'AUD $125k', icon: SiRust, color: '#000000' }
    ],
    futureJobs: [
      { role: 'Mining Technology Engineers', growth: '+40%', demand: 'High', avg_salary: 'AUD $135k' },
      { role: 'Agricultural Technology Specialists', growth: '+38%', demand: 'Growing', avg_salary: 'AUD $105k' },
      { role: 'Cybersecurity Analysts', growth: '+45%', demand: 'Very High', avg_salary: 'AUD $125k' },
      { role: 'Marine Technology Engineers', growth: '+32%', demand: 'Growing', avg_salary: 'AUD $115k' },
      { role: 'Smart City Planners', growth: '+35%', demand: 'High', avg_salary: 'AUD $110k' }
    ],
    techTrends: [
      { trend: 'Mining Tech', adoption: 73, impact: 'High' },
      { trend: 'AgTech Innovation', adoption: 65, impact: 'Growing' },
      { trend: 'Cybersecurity', adoption: 78, impact: 'Very High' }
    ],
    learningPaths: [
      { platform: 'RMIT Online', course: 'Data Science', rating: 4.7, students: '45k', price: 'AUD $3200/unit', duration: '18 months' },
      { platform: 'Udemy', course: 'React Complete Guide', rating: 4.6, students: '890k', price: 'AUD $199', duration: '4 months' }
    ],
    jobMarket: {
      openings: '95k',
      growth: '+16%',
      competitiveness: 'Medium',
      remoteRatio: '58%'
    }
  }
};

// --- COMPONENT ---
const SkillMap = () => {
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [hoveredCountry, setHoveredCountry] = useState(null);
  const [activeTab, setActiveTab] = useState("skills");

  // Map country names from geojson to our data
  const getCountryData = (countryName) => {
    const countryMappings = {
      "United States of America": "United States",
      USA: "United States",
      US: "United States",
      Britain: "United Kingdom",
      UK: "United Kingdom",
      Deutschland: "Germany",
      Australien: "Australia",
      Kanada: "Canada",
    };
    return stackOverflowData[countryMappings[countryName] || countryName];
  };

  // Get color for each country region
  const getCountryColor = (feature) => {
    const countryName =
      feature.properties.NAME ||
      feature.properties.NAME_EN ||
      feature.properties.ADMIN;
    const data = getCountryData(countryName);
    if (!data) return "#e5e7eb";
    const regionColors = {
      "North America": "#FFB3BA",
      Europe: "#BAFFC9",
      Asia: "#FFFFBA",
      Oceania: "#BAE1FF",
    };
    return regionColors[data.region] || "#e5e7eb";
  };

  // Style for GeoJSON layer
  const geoStyle = (feature) => {
    const countryName =
      feature.properties.NAME ||
      feature.properties.NAME_EN ||
      feature.properties.ADMIN;
    const data = getCountryData(countryName);
    const isHovered = hoveredCountry === countryName;
    const isSelected = selectedCountry === countryName;
    let fillColor = getCountryColor(feature);
    if (isHovered || isSelected) {
      fillColor = data
        ? data.region === "North America"
          ? "#FF9AA2"
          : data.region === "Europe"
          ? "#B5EAD7"
          : data.region === "Asia"
          ? "#FFDAC1"
          : data.region === "Oceania"
          ? "#C7CEEA"
          : "#e5e7eb"
        : "#e5e7eb";
    }
    return {
      fillColor,
      weight: isSelected ? 2 : isHovered ? 1.5 : 0.5,
      color: isSelected ? "#2563EB" : isHovered ? "#4B5563" : "#e5e7eb",
      fillOpacity: 1,
      opacity: 1,
    };
  };

  // --- SIDEBAR CARDS ---
  const SkillCard = ({ skill, index }) => {
    const IconComponent = skill.icon;
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-all duration-200">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center">
              <IconComponent className="w-4 h-4" style={{ color: skill.color }} />
            </div>
            <div>
              <h4 className="font-medium text-black text-sm">{skill.name}</h4>
              <span className="text-xs text-gray-500">#{index + 1}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-semibold text-black">{skill.percentage}%</div>
            <div className="text-xs text-green-600">{skill.growth}</div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="h-1.5 bg-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${skill.percentage}%` }}
            ></div>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-600">Avg Salary:</span>
            <span className="font-medium text-black">{skill.salary}</span>
          </div>
        </div>
      </div>
    );
  };

  const FutureJobCard = ({ job, index }) => (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h4 className="font-medium text-black text-sm">{job.role}</h4>
          <span className="text-xs text-gray-600">WEF Future Jobs #{index + 1}</span>
        </div>
        <div className="text-right">
          <div className="text-sm font-semibold text-green-600">{job.growth}</div>
          <div className="text-xs text-gray-600">{job.avg_salary}</div>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-600">Demand:</span>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          job.demand === 'Very High' ? 'bg-red-100 text-red-700' :
            job.demand === 'High' ? 'bg-orange-100 text-orange-700' :
              'bg-blue-100 text-blue-700'
        }`}>
          {job.demand}
        </span>
      </div>
    </div>
  );

  const TechTrendCard = ({ trend }) => (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium text-black text-sm">{trend.trend}</h4>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          trend.impact === 'Very High' ? 'bg-red-100 text-red-700' :
            trend.impact === 'High' ? 'bg-orange-100 text-orange-700' :
              'bg-blue-100 text-blue-700'
        }`}>
          {trend.impact}
        </span>
      </div>
      <div className="flex items-center space-x-2">
        <div className="flex-1 bg-gray-200 rounded-full h-1.5">
          <div
            className="bg-blue-500 h-1.5 rounded-full"
            style={{ width: `${trend.adoption}%` }}
          ></div>
        </div>
        <span className="text-xs font-medium text-gray-600">{trend.adoption}%</span>
      </div>
    </div>
  );

  const JobMarketStats = ({ jobMarket }) => (
    <div className="grid grid-cols-2 gap-3">
      <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
        <FiUsers className="w-5 h-5 text-blue-600 mx-auto mb-1" />
        <div className="text-xs text-gray-600">Open Positions</div>
        <div className="text-sm font-semibold text-black">{jobMarket.openings}</div>
      </div>
      <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
        <FiArrowUp className="w-5 h-5 text-green-600 mx-auto mb-1" />
        <div className="text-xs text-gray-600">Market Growth</div>
        <div className="text-sm font-semibold text-black">{jobMarket.growth}</div>
      </div>
      <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
        <BiWorld className="w-5 h-5 text-purple-600 mx-auto mb-1" />
        <div className="text-xs text-gray-600">Remote Jobs</div>
        <div className="text-sm font-semibold text-black">{jobMarket.remoteRatio}</div>
      </div>
      <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
        <FiTrendingUp className="w-5 h-5 text-orange-600 mx-auto mb-1" />
        <div className="text-xs text-gray-600">Competition</div>
        <div className="text-sm font-semibold text-black">{jobMarket.competitiveness}</div>
      </div>
    </div>
  );

  // --- MAIN RENDER ---
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <HiOutlineGlobeAlt className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-black">Global SkillMap 2024</h1>
                <p className="text-sm text-gray-600">
                  Stack Overflow + WEF Future Jobs Data
                </p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4 text-xs">
              <div className="flex items-center space-x-1">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: "#FFB3BA" }}
                ></div>
                <span className="text-black">North America</span>
              </div>
              <div className="flex items-center space-x-1">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: "#BAFFC9" }}
                ></div>
                <span className="text-black">Europe</span>
              </div>
              <div className="flex items-center space-x-1">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: "#FFFFBA" }}
                ></div>
                <span className="text-black">Asia</span>
              </div>
              <div className="flex items-center space-x-1">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: "#BAE1FF" }}
                ></div>
                <span className="text-black">Oceania</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map Section */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 border-b bg-gray-100">
                <h2 className="text-lg font-semibold text-black flex items-center">
                  <BiWorld className="mr-2 w-5 h-5" />
                  Interactive Global Map
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Click countries to explore tech ecosystems and future job trends
                </p>
              </div>
              <div className="h-[500px]">
                <MapContainer
                  center={[20, 0]}
                  zoom={0}
                  minZoom={2}
                  maxBounds={[
                    [-90, -180],
                    [90, 180],
                  ]}
                  style={{ height: "100%", width: "100%" }}
                  scrollWheelZoom={true}
                  className="rounded-b-xl"
                  attributionControl={false}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {/* <GeoJSON
                    data={customGeo}
                    style={geoStyle}
                    onEachFeature={(feature, layer) => {
                      const countryName =
                        feature.properties.NAME ||
                        feature.properties.NAME_EN ||
                        feature.properties.ADMIN;
                      const data = getCountryData(countryName);
                      layer.on({
                        mouseover: () => {
                          if (data) setHoveredCountry(countryName);
                        },
                        mouseout: () => setHoveredCountry(null),
                        click: () => {
                          if (data) setSelectedCountry(countryName);
                        },
                      });
                      if (data) {
                        layer.bindTooltip(
                          `<div style="color:#111;font-weight:bold">${countryName}</div>`,
                          { sticky: true }
                        );
                      }
                    }}
                  /> */}
                  {/* Markers */}
                  {Object.entries(stackOverflowData).map(([countryName, data]) => (
                    <Marker
                      key={countryName}
                      position={data.coordinates}
                      icon={L.divIcon({
                        className: "",
                        html: `<div style="background:white;border:2px solid ${data.color};border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-size:20px;">${data.flag}</div>`,
                        iconSize: [32, 32],
                        iconAnchor: [16, 16],
                      })}
                      eventHandlers={{
                        click: () => setSelectedCountry(countryName),
                        mouseover: () => setHoveredCountry(countryName),
                        mouseout: () => setHoveredCountry(null),
                      }}
                    >
                      <Tooltip direction="top" offset={[0, -20]} opacity={1} permanent={false}>
                        <span style={{ color: "#111", fontWeight: "bold" }}>{countryName}</span>
                      </Tooltip>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {selectedCountry && stackOverflowData[selectedCountry] ? (
              <>
                {/* Country Header */}
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                  <div
                    className="p-4 text-black relative"
                    style={{ backgroundColor: stackOverflowData[selectedCountry].color }}
                  >
                    <button
                      onClick={() => setSelectedCountry(null)}
                      className="absolute top-3 right-3 text-black/80 hover:text-black"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                    <div className="flex items-center space-x-3 mb-3">
                      <span className="text-2xl">{stackOverflowData[selectedCountry].flag}</span>
                      <div>
                        <h3 className="text-lg font-bold">{selectedCountry}</h3>
                        <p className="text-black/90 text-sm">{stackOverflowData[selectedCountry].region}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="flex items-center">
                        <FiMapPin className="mr-1 w-3 h-3" />
                        <span>Pop: {stackOverflowData[selectedCountry].population}</span>
                      </div>
                      <div className="flex items-center">
                        <HiOutlineCode className="mr-1 w-3 h-3" />
                        <span>{stackOverflowData[selectedCountry].developers} devs</span>
                      </div>
                      <div className="col-span-2 flex items-center">
                        <FiDollarSign className="mr-1 w-3 h-3" />
                        <span>Avg: {stackOverflowData[selectedCountry].avgSalary}</span>
                      </div>
                    </div>
                  </div>
                  {/* Tabs */}
                  <div className="flex border-b">
                    {[
                      { id: 'skills', label: 'Skills', icon: HiOutlineCode },
                      { id: 'future', label: 'Future Jobs', icon: FiTrendingUp },
                      { id: 'trends', label: 'Trends', icon: HiOutlineTrendingUp },
                      { id: 'jobs', label: 'Market', icon: FiUsers }
                    ].map(tab => {
                      const IconComponent = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`flex-1 px-2 py-2 text-xs font-medium transition-colors flex items-center justify-center space-x-1 ${
                            activeTab === tab.id
                              ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
                              : 'text-black hover:text-blue-800'
                          }`}
                        >
                          <IconComponent className="w-3 h-3" />
                          <span>{tab.label}</span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="p-4">
                    {activeTab === 'skills' && (
                      <div className="space-y-3">
                        <h4 className="font-semibold text-black text-sm mb-3">Top Programming Skills</h4>
                        {stackOverflowData[selectedCountry].topSkills.map((skill, index) => (
                          <SkillCard
                            key={skill.name}
                            skill={skill}
                            index={index}
                          />
                        ))}
                      </div>
                    )}
                    {activeTab === 'future' && (
                      <div className="space-y-3">
                        <h4 className="font-semibold text-black text-sm mb-3">Future Job Opportunities</h4>
                        <p className="text-xs text-gray-600 mb-3">Based on WEF Future of Jobs Report 2023</p>
                        {stackOverflowData[selectedCountry].futureJobs.map((job, index) => (
                          <FutureJobCard key={index} job={job} index={index} />
                        ))}
                      </div>
                    )}
                    {activeTab === 'trends' && (
                      <div className="space-y-3">
                        <h4 className="font-semibold text-black text-sm mb-3">Tech Trends</h4>
                        {stackOverflowData[selectedCountry].techTrends.map((trend, index) => (
                          <TechTrendCard key={index} trend={trend} />
                        ))}
                      </div>
                    )}
                    {activeTab === 'jobs' && (
                      <div className="space-y-4">
                        <h4 className="font-semibold text-black text-sm">Job Market Overview</h4>
                        <JobMarketStats
                          jobMarket={stackOverflowData[selectedCountry].jobMarket}
                        />
                        <div>
                          <h5 className="font-medium text-gray-700 text-sm mb-2">Learning Resources</h5>
                          <div className="space-y-2">
                            {stackOverflowData[selectedCountry].learningPaths.map((path, index) => (
                              <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                                <div className="flex justify-between items-start mb-1">
                                  <div>
                                    <h6 className="font-medium text-black text-xs">{path.platform}</h6>
                                    <p className="text-xs text-gray-600">{path.course}</p>
                                  </div>
                                  <div className="text-right text-xs">
                                    <div className="text-green-600 font-medium">{path.price}</div>
                                    <div className="text-gray-500">{path.duration}</div>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2 text-xs">
                                  <span className="flex items-center">
                                    <FiStar className="text-yellow-500 mr-1 w-3 h-3" />
                                    {path.rating}
                                  </span>
                                  <span className="text-gray-600">{path.students}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white border border-gray-200 rounded-xl p-8 text-center shadow-sm">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <HiOutlineGlobeAlt className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-black mb-2">
                  Explore Global Tech Markets
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Click on any country to discover skills, future jobs, and market trends.
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                  <div>🇺🇸 United States</div>
                  <div>🇩🇪 Germany</div>
                  <div>🇮🇳 India</div>
                  <div>🇬🇧 United Kingdom</div>
                  <div>🇨🇦 Canada</div>
                  <div>🇦🇺 Australia</div>
                </div>
              </div>
            )}
            {/* Global Insights */}
            <div className="bg-blue-100 text-black rounded-xl p-4 shadow-sm">
              <h4 className="font-semibold text-sm mb-3 flex items-center">
                <BiTrendingUp className="mr-2 w-4 h-4" />
                2024 Global Tech Insights
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span>Most Popular:</span>
                  <span className="font-medium">JavaScript (63.8%)</span>
                </div>
                <div className="flex justify-between">
                  <span>Fastest Growing:</span>
                  <span className="font-medium">Rust (+15.7%)</span>
                </div>
                <div className="flex justify-between">
                  <span>Highest Paying:</span>
                  <span className="font-medium">Rust ($155k)</span>
                </div>
                <div className="flex justify-between">
                  <span>Future Leader:</span>
                  <span className="font-medium">AI/ML (+40%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillMap;