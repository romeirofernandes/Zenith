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
} from "lucide-react";

import Profile from "../components/Dashboard/Profile";
import Jobs from "@/components/Dashboard/Jobs";
import WishList from "@/components/Dashboard/WishList";
import Tests from "../components/dashboard/Tests";

const sidebarItems = [
  { id: "profile", label: "Profile", icon: User },
  { id: "jobs", label: "Jobs", icon: Briefcase },
  { id: "wishlist", label: "Wishlist", icon: Heart },
  { id: "tests", label: "Tests", icon: PenTool },
  { id: "latex", label: "LaTeX", icon: FileText },
  { id: "interview", label: "Interview", icon: MessageSquare },
];

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      console.log("Firebase User:", firebaseUser); // Log the Firebase user
      setUser(firebaseUser);
      if (firebaseUser) {
        fetchProfile(firebaseUser);
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
      tests: <Tests />,
    };

    return content[activeTab] || content.profile;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground text-xl">Loading user...</div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        {/* Sidebar */}
        <Sidebar className="border-r bg-sidebar">
          <SidebarHeader className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Briefcase className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-sidebar-foreground">
                  SOS Dashboard
                </span>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {sidebarItems.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full justify-start gap-3 ${
                          activeTab === item.id
                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        }`}
                      >
                        <item.icon className="h-4 w-4" />
                        <span className="font-medium">{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.photoURL} alt={getUserDisplayName()} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {getUserDisplayName()}
                </p>
                <p className="text-xs text-sidebar-foreground/70 truncate">
                  {getUserEmail()}
                </p>
              </div>
            </div>
            <Separator className="mb-4" />
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start gap-2 text-red-500 hover:bg-red-100"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </SidebarFooter>
        </Sidebar>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center justify-between p-4 border-b bg-background">
            <SidebarTrigger className="lg:hidden">
              <Menu className="h-6 w-6" />
            </SidebarTrigger>
            <h1 className="text-lg font-semibold">Zenith</h1>
          </div>

          {/* Main Content Area */}
          <main className="flex-1 overflow-auto">
            <div className="container mx-auto p-4 lg:p-6">
              {renderContent()}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
