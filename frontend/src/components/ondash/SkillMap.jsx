import React, { useState, useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Tooltip,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import {
  FiTrendingUp,
  FiStar,
  FiX,
  FiUsers,
  FiDollarSign,
  FiArrowUp,
  FiMapPin,
  FiArrowLeft,
} from "react-icons/fi";
import {
  HiOutlineGlobeAlt,
  HiOutlineCode,
  HiOutlineTrendingUp,
} from "react-icons/hi";
import { BiWorld, BiTrendingUp, BiBuilding } from "react-icons/bi";
import {
  SiReact,
  SiJavascript,
  SiPython,
  SiTypescript,
  SiRust,
  SiGo,
  SiNodedotjs,
  SiCplusplus,
  SiPhp,
  SiKotlin,
  SiSwift,
  SiDart,
} from "react-icons/si";

// Map Control Component with smooth transitions
const MapController = ({ center, zoom, bounds }) => {
  const map = useMap();

  useEffect(() => {
    if (bounds) {
      map.flyToBounds(bounds, {
        padding: [50, 50],
        duration: 1.5,
        easeLinearity: 0.25,
      });
    } else if (center && zoom) {
      map.flyTo(center, zoom, {
        duration: 1.5,
        easeLinearity: 0.25,
      });
    }
  }, [map, center, zoom, bounds]);

  return null;
};

// --- COMPONENT ---
const SkillMap = () => {
  const [skillMapData, setSkillMapData] = useState({});
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [hoveredCountry, setHoveredCountry] = useState(null);
  const [activeTab, setActiveTab] = useState("skills");
  const [mapView, setMapView] = useState("world"); // "world", "country", "city"
  const [isTransitioning, setIsTransitioning] = useState(false);
  const mapRef = useRef();

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/skillmap`)
      .then((res) => res.json())
      .then((json) => setSkillMapData(json))
      .catch((err) => console.error("Failed to fetch skill map data:", err));
  }, []);

  const handleCountryClick = (countryName) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setSelectedCountry(countryName);
    setSelectedCity(null);
    setMapView("country");
    setActiveTab("skills");

    // Reset transition flag after animation
    setTimeout(() => setIsTransitioning(false), 1600);
  };

  const handleCityClick = (city, countryName) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setSelectedCity(city);
    setSelectedCountry(countryName);
    setMapView("city");
    setActiveTab("skills");

    setTimeout(() => setIsTransitioning(false), 1600);
  };

  const handleBackToWorld = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setSelectedCountry(null);
    setSelectedCity(null);
    setMapView("world");

    setTimeout(() => setIsTransitioning(false), 1600);
  };

  const handleBackToCountry = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setSelectedCity(null);
    setMapView("country");

    setTimeout(() => setIsTransitioning(false), 1600);
  };

  // Get current map configuration
  const getMapConfig = () => {
    if (mapView === "city" && selectedCity) {
      return {
        center: selectedCity.coordinates,
        zoom: 12,
        bounds: null,
      };
    } else if (
      mapView === "country" &&
      selectedCountry &&
      skillMapData[selectedCountry]
    ) {
      const countryData = skillMapData[selectedCountry];
      return {
        center: countryData.coordinates,
        zoom: countryData.zoom || 6,
        bounds: null,
      };
    } else {
      return {
        center: [20, 0],
        zoom: 2,
        bounds: null,
      };
    }
  };

  // Enhanced skill icon mapping
  const getSkillIcon = (skillName) => {
    const iconMap = {
      JavaScript: SiJavascript,
      Python: SiPython,
      TypeScript: SiTypescript,
      React: SiReact,
      Rust: SiRust,
      Go: SiGo,
      "Node.js": SiNodedotjs,
      "C++": SiCplusplus,
      PHP: SiPhp,
      Kotlin: SiKotlin,
      Swift: SiSwift,
      Dart: SiDart,
    };
    return iconMap[skillName] || SiJavascript;
  };

  // --- SIDEBAR CARDS ---
  const SkillCard = ({ skill, index }) => {
    const IconComponent = getSkillIcon(skill.name);

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-all duration-300 hover:scale-105">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center">
              <IconComponent
                className="w-4 h-4"
                style={{ color: skill.color || "#3B82F6" }}
              />
            </div>
            <div>
              <h4 className="font-medium text-black text-sm">{skill.name}</h4>
              <span className="text-xs text-gray-500">#{index + 1}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-semibold text-black">
              {skill.percentage}%
            </div>
            <div className="text-xs text-green-600 font-medium">
              {skill.growth}
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-1000 ease-out"
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
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3 hover:shadow-md transition-all duration-300">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h4 className="font-medium text-black text-sm">{job.role}</h4>
          <span className="text-xs text-gray-600">Future Job #{index + 1}</span>
        </div>
        <div className="text-right">
          <div className="text-sm font-semibold text-green-600">
            {job.growth}
          </div>
          <div className="text-xs text-gray-600">{job.avg_salary}</div>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-600">Demand:</span>
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            job.demand === "Very High"
              ? "bg-red-100 text-red-700"
              : job.demand === "High"
              ? "bg-orange-100 text-orange-700"
              : "bg-blue-100 text-blue-700"
          }`}
        >
          {job.demand}
        </span>
      </div>
    </div>
  );

  const TechTrendCard = ({ trend }) => (
    <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-3 hover:shadow-md transition-all duration-300">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium text-black text-sm">{trend.trend}</h4>
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            trend.impact === "Very High"
              ? "bg-red-100 text-red-700"
              : trend.impact === "High"
              ? "bg-orange-100 text-orange-700"
              : "bg-blue-100 text-blue-700"
          }`}
        >
          {trend.impact}
        </span>
      </div>
      <div className="flex items-center space-x-2">
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-purple-400 to-purple-600 h-2 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${trend.adoption}%` }}
          ></div>
        </div>
        <span className="text-xs font-medium text-gray-600">
          {trend.adoption}%
        </span>
      </div>
    </div>
  );

  const JobMarketStats = ({ jobMarket }) => (
    <div className="grid grid-cols-2 gap-3">
      <div className="bg-white border border-gray-200 rounded-lg p-3 text-center hover:shadow-md transition-all duration-300">
        <FiUsers className="w-5 h-5 text-blue-600 mx-auto mb-1" />
        <div className="text-xs text-gray-600">Open Positions</div>
        <div className="text-sm font-semibold text-black">
          {jobMarket?.openings}
        </div>
      </div>
      <div className="bg-white border border-gray-200 rounded-lg p-3 text-center hover:shadow-md transition-all duration-300">
        <FiArrowUp className="w-5 h-5 text-green-600 mx-auto mb-1" />
        <div className="text-xs text-gray-600">Market Growth</div>
        <div className="text-sm font-semibold text-black">
          {jobMarket?.growth}
        </div>
      </div>
      <div className="bg-white border border-gray-200 rounded-lg p-3 text-center hover:shadow-md transition-all duration-300">
        <BiWorld className="w-5 h-5 text-purple-600 mx-auto mb-1" />
        <div className="text-xs text-gray-600">Remote Jobs</div>
        <div className="text-sm font-semibold text-black">
          {jobMarket?.remoteRatio}
        </div>
      </div>
      <div className="bg-white border border-gray-200 rounded-lg p-3 text-center hover:shadow-md transition-all duration-300">
        <FiTrendingUp className="w-5 h-5 text-orange-600 mx-auto mb-1" />
        <div className="text-xs text-gray-600">Competition</div>
        <div className="text-sm font-semibold text-black">
          {jobMarket?.competitiveness}
        </div>
      </div>
    </div>
  );

  const mapConfig = getMapConfig();

  // --- MAIN RENDER ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <HiOutlineGlobeAlt className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg md:text-xl font-bold text-black">
                  Global SkillMap 2024
                </h1>
                <p className="text-sm text-gray-600">
                  Interactive Tech Talent & Future Jobs Explorer
                </p>
              </div>
            </div>

            {/* Navigation Breadcrumb */}
            <div className="flex items-center space-x-2 text-sm mt-3 md:mt-0">
              {mapView !== "world" && (
                <button
                  onClick={handleBackToWorld}
                  disabled={isTransitioning}
                  className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 transition-colors disabled:opacity-50"
                >
                  <FiArrowLeft className="w-4 h-4" />
                  <span>World</span>
                </button>
              )}
              {mapView === "city" && (
                <>
                  <span className="text-gray-400">/</span>
                  <button
                    onClick={handleBackToCountry}
                    disabled={isTransitioning}
                    className="text-blue-600 hover:text-blue-800 transition-colors disabled:opacity-50"
                  >
                    {selectedCountry}
                  </button>
                  <span className="text-gray-400">/</span>
                  <span className="text-gray-700">{selectedCity?.name}</span>
                </>
              )}
              {mapView === "country" && selectedCountry && (
                <>
                  <span className="text-gray-400">/</span>
                  <span className="text-gray-700">{selectedCountry}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map Section */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-lg relative">
              <div className="p-4 border-b bg-gradient-to-r from-gray-50 to-gray-100">
                <h2 className="text-lg font-semibold text-black flex items-center">
                  <BiWorld className="mr-2 w-5 h-5" />
                  {mapView === "world" && "Interactive Global Map"}
                  {mapView === "country" && `${selectedCountry} - Tech Cities`}
                  {mapView === "city" && `${selectedCity?.name} - Tech Hub`}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {mapView === "world" &&
                    "Click countries to explore tech ecosystems"}
                  {mapView === "country" &&
                    "Click cities to explore local tech scenes"}
                  {mapView === "city" && "Detailed city-level tech insights"}
                </p>
              </div>
              <div className="h-[500px] relative z-10">
                {" "}
                {/* Fixed z-index */}
                {isTransitioning && (
                  <div className="absolute inset-0 bg-white/20 z-20 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                )}
                <MapContainer
                  ref={mapRef}
                  center={mapConfig.center}
                  zoom={mapConfig.zoom}
                  style={{ height: "100%", width: "100%" }}
                  scrollWheelZoom={true}
                  className="rounded-b-xl"
                  attributionControl={false}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <MapController
                    center={mapConfig.center}
                    zoom={mapConfig.zoom}
                    bounds={mapConfig.bounds}
                  />

                  {/* World View - Show Countries */}
                  {mapView === "world" &&
                    Object.entries(skillMapData).map(([countryName, data]) => (
                      <Marker
                        key={countryName}
                        position={data.coordinates}
                        icon={L.divIcon({
                          className: "",
                          html: `<div style="background:${data.color};border:3px solid white;border-radius:50%;width:40px;height:40px;display:flex;align-items:center;justify-content:center;font-size:20px;box-shadow:0 4px 12px rgba(0,0,0,0.2);cursor:pointer;transition:transform 0.2s ease;">${data.flag}</div>`,
                          iconSize: [40, 40],
                          iconAnchor: [20, 20],
                        })}
                        eventHandlers={{
                          click: () => handleCountryClick(countryName),
                          mouseover: () => setHoveredCountry(countryName),
                          mouseout: () => setHoveredCountry(null),
                        }}
                      >
                        <Tooltip
                          direction="top"
                          offset={[0, -25]}
                          opacity={1}
                          permanent={false}
                        >
                          <div className="text-center">
                            <div className="font-bold text-black">
                              {countryName}
                            </div>
                            <div className="text-xs text-gray-600">
                              {data.developers} developers
                            </div>
                          </div>
                        </Tooltip>
                      </Marker>
                    ))}

                  {/* Country View - Show Cities */}
                  {mapView === "country" &&
                    selectedCountry &&
                    skillMapData[selectedCountry]?.cities?.map((city, idx) => (
                      <Marker
                        key={`${selectedCountry}-city-${idx}`}
                        position={city.coordinates}
                        icon={L.divIcon({
                          className: "",
                          html: `<div style="background:${
                            city.color || "#FFE4E1"
                          };border:2px solid #4F46E5;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-size:16px;box-shadow:0 2px 8px rgba(0,0,0,0.15);cursor:pointer;transition:transform 0.2s ease;">🏙️</div>`,
                          iconSize: [32, 32],
                          iconAnchor: [16, 16],
                        })}
                        eventHandlers={{
                          click: () => handleCityClick(city, selectedCountry),
                        }}
                      >
                        <Tooltip
                          direction="top"
                          offset={[0, -18]}
                          opacity={1}
                          permanent={false}
                        >
                          <div className="text-center">
                            <div className="font-bold text-black">
                              {city.name}
                            </div>
                            <div className="text-xs text-gray-600">
                              {city.developers} devs • {city.avgSalary}
                            </div>
                          </div>
                        </Tooltip>
                      </Marker>
                    ))}

                  {/* City View - Show City Details */}
                  {mapView === "city" && selectedCity && (
                    <Marker
                      position={selectedCity.coordinates}
                      icon={L.divIcon({
                        className: "",
                        html: `<div style="background:${
                          selectedCity.color || "#FFE4E1"
                        };border:3px solid #EF4444;border-radius:50%;width:50px;height:50px;display:flex;align-items:center;justify-content:center;font-size:24px;box-shadow:0 4px 16px rgba(0,0,0,0.25);animation:pulse 2s infinite;">🏢</div>`,
                        iconSize: [50, 50],
                        iconAnchor: [25, 25],
                      })}
                    >
                      <Tooltip
                        direction="top"
                        offset={[0, -30]}
                        opacity={1}
                        permanent={true}
                      >
                        <div className="text-center">
                          <div className="font-bold text-black">
                            {selectedCity.name}
                          </div>
                          <div className="text-xs text-gray-600">
                            Tech Hub Center
                          </div>
                        </div>
                      </Tooltip>
                    </Marker>
                  )}
                </MapContainer>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {selectedCountry || selectedCity ? (
              <>
                {/* Location Header */}
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-lg transform transition-all duration-500">
                  <div
                    className="p-4 text-black relative"
                    style={{
                      background: selectedCity
                        ? `linear-gradient(135deg, ${
                            selectedCity.color || "#FFE4E1"
                          }, ${selectedCity.color || "#FFE4E1"}dd)`
                        : `linear-gradient(135deg, ${skillMapData[selectedCountry]?.color}, ${skillMapData[selectedCountry]?.color}dd)`,
                    }}
                  >
                    <button
                      onClick={
                        selectedCity ? handleBackToCountry : handleBackToWorld
                      }
                      disabled={isTransitioning}
                      className="absolute top-3 right-3 text-black/80 hover:text-black transition-colors disabled:opacity-50"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                    <div className="flex items-center space-x-3 mb-3">
                      <span className="text-3xl">
                        {selectedCity
                          ? "🏙️"
                          : skillMapData[selectedCountry]?.flag}
                      </span>
                      <div>
                        <h3 className="text-lg font-bold">
                          {selectedCity ? selectedCity.name : selectedCountry}
                        </h3>
                        <p className="text-black/90 text-sm">
                          {selectedCity
                            ? `${selectedCountry} • ${
                                selectedCity.population || "Major Tech Hub"
                              }`
                            : skillMapData[selectedCountry]?.region}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="flex items-center">
                        <BiBuilding className="mr-1 w-3 h-3" />
                        <span>
                          {selectedCity
                            ? `${
                                selectedCity.techCompanies || "500+"
                              } companies`
                            : `Pop: ${skillMapData[selectedCountry]?.population}`}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <HiOutlineCode className="mr-1 w-3 h-3" />
                        <span>
                          {selectedCity
                            ? selectedCity.developers
                            : skillMapData[selectedCountry]?.developers}{" "}
                          devs
                        </span>
                      </div>
                      <div className="col-span-2 flex items-center">
                        <FiDollarSign className="mr-1 w-3 h-3" />
                        <span>
                          Avg:{" "}
                          {selectedCity
                            ? selectedCity.avgSalary
                            : skillMapData[selectedCountry]?.avgSalary}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Tabs */}
                  <div className="flex border-b">
                    {[
                      { id: "skills", label: "Skills", icon: HiOutlineCode },
                      {
                        id: "future",
                        label: "Future Jobs",
                        icon: FiTrendingUp,
                      },
                      {
                        id: "trends",
                        label: "Trends",
                        icon: HiOutlineTrendingUp,
                      },
                      { id: "jobs", label: "Market", icon: FiUsers },
                    ].map((tab) => {
                      const IconComponent = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`flex-1 px-2 py-3 text-xs font-medium transition-all duration-300 flex items-center justify-center space-x-1 ${
                            activeTab === tab.id
                              ? "border-b-2 border-blue-500 text-blue-600 bg-blue-50"
                              : "text-black hover:text-blue-800 hover:bg-gray-50"
                          }`}
                        >
                          <IconComponent className="w-3 h-3" />
                          <span>{tab.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="p-4">
                    {activeTab === "skills" && (
                      <div className="space-y-3 animate-fadeIn">
                        <h4 className="font-semibold text-black text-sm mb-3">
                          Top Programming Skills
                        </h4>
                        {(selectedCity
                          ? selectedCity.topSkills
                          : skillMapData[selectedCountry]?.topSkills
                        )?.map((skill, index) => (
                          <SkillCard
                            key={skill.name}
                            skill={skill}
                            index={index}
                          />
                        ))}
                      </div>
                    )}

                    {activeTab === "future" && (
                      <div className="space-y-3 animate-fadeIn">
                        <h4 className="font-semibold text-black text-sm mb-3">
                          Future Job Opportunities
                        </h4>
                        <p className="text-xs text-gray-600 mb-3">
                          High-growth tech roles
                        </p>
                        {(selectedCity
                          ? selectedCity.futureJobs
                          : skillMapData[selectedCountry]?.futureJobs
                        )?.map((job, index) => (
                          <FutureJobCard key={index} job={job} index={index} />
                        ))}
                      </div>
                    )}

                    {activeTab === "trends" && (
                      <div className="space-y-3 animate-fadeIn">
                        <h4 className="font-semibold text-black text-sm mb-3">
                          Tech Trends
                        </h4>
                        {(selectedCity
                          ? selectedCity.techTrends
                          : skillMapData[selectedCountry]?.techTrends
                        )?.map((trend, index) => (
                          <TechTrendCard key={index} trend={trend} />
                        ))}
                      </div>
                    )}

                    {activeTab === "jobs" && !selectedCity && (
                      <div className="space-y-4 animate-fadeIn">
                        <h4 className="font-semibold text-black text-sm">
                          Job Market Overview
                        </h4>
                        <JobMarketStats
                          jobMarket={skillMapData[selectedCountry]?.jobMarket}
                        />
                        <div>
                          <h5 className="font-medium text-gray-700 text-sm mb-2">
                            Learning Resources
                          </h5>
                          <div className="space-y-2">
                            {skillMapData[selectedCountry]?.learningPaths?.map(
                              (path, index) => (
                                <div
                                  key={index}
                                  className="bg-gray-50 border border-gray-200 rounded-lg p-3 hover:shadow-md transition-all duration-300"
                                >
                                  <div className="flex justify-between items-start mb-1">
                                    <div>
                                      <h6 className="font-medium text-black text-xs">
                                        {path.platform}
                                      </h6>
                                      <p className="text-xs text-gray-600">
                                        {path.course}
                                      </p>
                                    </div>
                                    <div className="text-right text-xs">
                                      <div className="text-green-600 font-medium">
                                        {path.price}
                                      </div>
                                      <div className="text-gray-500">
                                        {path.duration}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2 text-xs">
                                    <span className="flex items-center">
                                      <FiStar className="text-yellow-500 mr-1 w-3 h-3" />
                                      {path.rating}
                                    </span>
                                    <span className="text-gray-600">
                                      {path.students}
                                    </span>
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white border border-gray-200 rounded-xl p-8 text-center shadow-lg">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <HiOutlineGlobeAlt className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-black mb-2">
                  Explore Global Tech Markets
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Click on any country to discover skills, future jobs, and
                  market trends.
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
          </div>
        </div>
      </div>

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeIn {
            animation: fadeIn 2s ease-out;
          }
        `}
      </style>
    </div>
  );
};

export default SkillMap;
