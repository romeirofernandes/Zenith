import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "../config/firebase";
import { useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  User,
  FileText,
  MessageSquare,
  Briefcase,
  Heart,
  PenTool,
  LogOut,
  Menu,
  Globe,
  Award,
  BarChart3,
  FileUser,
  Lightbulb,
  Target,
} from "lucide-react";

import Profile from "../components/dashboard/Profile";
import Jobs from "@/components/dashboard/Jobs";
import WishList from "@/components/dashboard/WishList";
import Tests from "../components/dashboard/Tests";
import InterviewPrep from "./InterviewPrep";
import SkillMap from "../components/dashboard/SkillMap";
import ResumeBuilder from "../components/dashboard/ResumeBuilder";
import Achievements from "../components/dashboard/Achievements";
import ProfileAnalytics from "../components/dashboard/ProfileAnalytics";
import ProjectRecommendations from "../components/dashboard/ProjectRecommendations";
import ColdEmail from "../components/dashboard/ColdEmail";

// Update the scrollbarHideStyle constant at the top of the file
const scrollbarHideStyle = `
  .scrollbar-hide {
    -ms-overflow-style: none !important;
    scrollbar-width: none !important;
  }
  .scrollbar-hide::-webkit-scrollbar {
    width: 0 !important;
    height: 0 !important;
    display: none !important;
  }
  * {
    -ms-overflow-style: none !important;
    scrollbar-width: none !important;
  }
  *::-webkit-scrollbar {
    width: 0 !important;
    height: 0 !important;
    display: none !important;
  }
`;

// Inject the CSS
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = scrollbarHideStyle;
  document.head.appendChild(styleSheet);
}

const sidebarItems = [
  { id: "profile", label: "Profile", icon: User },
  { id: "jobs", label: "Jobs", icon: Briefcase },
  { id: "wishlist", label: "Wishlist", icon: Heart },
  { id: "skillmap", label: "SkillMap", icon: Globe },
  { id: "resume", label: "Resume Builder", icon: FileUser },
  { id: "projects", label: "Project Ideas", icon: Lightbulb },
  { id: "coldemail", label: "Cold Email", icon: Target },
  { id: "achievements", label: "Achievements", icon: Award },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "tests", label: "Tests", icon: PenTool },
  { id: "interview", label: "Interview", icon: MessageSquare },
];

// Animation variants
const sidebarVariants = {
  hidden: { x: -300, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
      staggerChildren: 0.1,
    },
  },
};

const menuItemVariants = {
  hidden: { x: -20, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25,
    },
  },
  hover: {
    x: 8,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10,
    },
  },
};

const contentVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
      duration: 0.3,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.95,
    transition: {
      duration: 0.2,
    },
  },
};

const avatarVariants = {
  hover: {
    scale: 1.1,
    rotate: [0, -5, 5, 0],
    transition: {
      scale: { type: "spring", stiffness: 300 },
      rotate: { duration: 0.5 },
    },
  },
};

const logoVariants = {
  initial: { scale: 1, rotate: 0 },
  hover: {
    scale: 1.1,
    rotate: 360,
    transition: {
      duration: 0.6,
      ease: "easeInOut",
    },
  },
};

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      console.log("Firebase User:", firebaseUser);
      setUser(firebaseUser);
      if (firebaseUser) {
        fetchProfile(firebaseUser);
      } else {
        setIsLoading(false);
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
    try {
      const token = await currentUser.getIdToken();
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/profile/profile`,
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
    } finally {
      setIsLoading(false);
    }
  };

  const getUserDisplayName = () => {
    if (userProfile?.profile?.firstName && userProfile?.profile?.lastName) {
      return `${userProfile.profile.firstName} ${userProfile.profile.lastName}`;
    }
    return user?.displayName || "User";
  };

  const getUserEmail = () => {
    return userProfile?.email || user?.email || "No email";
  };

  const getUserInitials = () => {
    const displayName = getUserDisplayName();
    return displayName
      .split(" ")
      .map((name) => name[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const renderContent = () => {
    const content = {
      profile: <Profile user={user} userProfile={userProfile} />,
      jobs: <Jobs currentUser={user} />,
      wishlist: <WishList />,
      skillmap: <SkillMap />,
      resume: <ResumeBuilder />,
      projects: <ProjectRecommendations />,
      coldemail: <ColdEmail />,
      achievements: <Achievements />,
      analytics: <ProfileAnalytics />,
      tests: <Tests />,
      interview: <InterviewPrep />,
    };

    return content[activeTab] || content.profile;
  };

  // Define components that need full-screen layout (no container padding)
  const fullScreenComponents = [
    "skillmap",
    "resume",
    "projects",
    "coldemail",
    "achievements",
    "analytics",
  ];

  if (isLoading) {
    return (
      <motion.div
        className="min-h-screen bg-background flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="h-12 w-12 bg-primary rounded-lg flex items-center justify-center"
        >
          <Briefcase className="h-6 w-6 text-primary-foreground" />
        </motion.div>
        <motion.div
          className="ml-4 text-foreground text-xl"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          Loading user...
        </motion.div>
      </motion.div>
    );
  }

  if (!user) {
    return (
      <motion.div
        className="min-h-screen bg-background flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-foreground text-xl">
          Please sign in to continue
        </div>
      </motion.div>
    );
  }

  return (
    <SidebarProvider>
      <motion.div
        className="min-h-screen flex w-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Sidebar */}
        <motion.div
          variants={sidebarVariants}
          initial="hidden"
          animate="visible"
        >
          <Sidebar className="border-r bg-sidebar relative overflow-hidden">
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/5 pointer-events-none" />

            <SidebarHeader className="p-4 relative z-10">
              <motion.div
                className="flex items-center gap-3"
                whileHover="hover"
              >
                <motion.div
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground relative overflow-hidden"
                  variants={logoVariants}
                  initial="initial"
                  whileHover="hover"
                >
                  <Briefcase className="h-4 w-4" />
                  {/* Shine effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{
                      x: [-100, 100],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 3,
                    }}
                  />
                </motion.div>
                <div className="flex flex-col">
                  <motion.span
                    className="font-semibold text-sidebar-foreground"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    Zenith
                  </motion.span>
                </div>
              </motion.div>
            </SidebarHeader>

            <SidebarContent className="relative z-10">
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <AnimatePresence>
                      {sidebarItems.map((item, index) => (
                        <motion.div
                          key={item.id}
                          variants={menuItemVariants}
                          initial="hidden"
                          animate="visible"
                          custom={index}
                          whileHover="hover"
                          transition={{ delay: index * 0.1 }}
                        >
                          <SidebarMenuItem>
                            <motion.div
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <SidebarMenuButton
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full justify-start gap-3 relative overflow-hidden transition-all duration-300 ${
                                  activeTab === item.id
                                    ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-lg"
                                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                                }`}
                              >
                                {/* Active indicator */}
                                {activeTab === item.id && (
                                  <motion.div
                                    className="absolute left-0 top-0 bottom-0 w-1 bg-primary"
                                    layoutId="activeIndicator"
                                    initial={{ scaleY: 0 }}
                                    animate={{ scaleY: 1 }}
                                    transition={{
                                      type: "spring",
                                      stiffness: 300,
                                    }}
                                  />
                                )}

                                <motion.div
                                  animate={
                                    activeTab === item.id
                                      ? { rotate: 360 }
                                      : { rotate: 0 }
                                  }
                                  transition={{ duration: 0.3 }}
                                >
                                  <item.icon className="h-4 w-4" />
                                </motion.div>
                                <span className="font-medium">
                                  {item.label}
                                </span>

                                {/* Ripple effect on click */}
                                <motion.div
                                  className="absolute inset-0 bg-white/10 rounded-md"
                                  initial={{ scale: 0, opacity: 0 }}
                                  whileTap={{ scale: 1, opacity: 1 }}
                                  transition={{ duration: 0.2 }}
                                />
                              </SidebarMenuButton>
                            </motion.div>
                          </SidebarMenuItem>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="p-4 relative z-10">
              <motion.div
                className="flex items-center gap-3 mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Avatar className="h-10 w-10 ring-2 ring-primary/20 transition-all duration-300">
                  <AvatarImage src={user.photoURL} alt={getUserDisplayName()} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <motion.p
                    className="text-sm font-medium text-sidebar-foreground truncate"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                  >
                    {getUserDisplayName()}
                  </motion.p>
                  <motion.p
                    className="text-xs text-sidebar-foreground/70 truncate"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                  >
                    {getUserEmail()}
                  </motion.p>
                </div>
              </motion.div>
              <Separator className="mb-4" />
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="w-full justify-start gap-2 text-red-500 hover:bg-red-100 hover:text-red-600 transition-all duration-300 relative overflow-hidden group"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </SidebarFooter>
          </Sidebar>
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Mobile Header */}
          <motion.div
            className="lg:hidden flex items-center justify-between p-4 border-b bg-background"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <SidebarTrigger className="lg:hidden">
              <motion.div
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.3 }}
              >
                <Menu className="h-6 w-6" />
              </motion.div>
            </SidebarTrigger>
            <motion.h1
              className="text-lg font-semibold"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Zenith
            </motion.h1>
          </motion.div>

          {/* Main Content Area */}
          <main className="flex-1 overflow-hidden scrollbar-hide">
            <motion.div
              className={`h-full overflow-y-auto scrollbar-hide ${
                fullScreenComponents.includes(activeTab)
                  ? "p-0"
                  : "container mx-auto p-4 lg:p-6"
              }`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
                WebkitOverflowScrolling: "touch",
              }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  variants={contentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="h-full"
                >
                  {renderContent()}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </main>
        </div>
      </motion.div>
    </SidebarProvider>
  );
};

export default Dashboard;
