import React from "react";
import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import Features from "@/components/landing/Features";
import Footer from "@/components/landing/Footer";
import MarqueeDemo from "@/components/landing/MarqueeDemo";
import GridBackground from "@/components/landing/GridBackground"; 

const Landing = () => {
  return (
    <div className="bg-background min-h-screen relative">
      <GridBackground />
      <Navbar />
      <main className="pt-24 relative z-10">
        <HeroSection />
        <Features />
        <MarqueeDemo />
      </main>
      <Footer />
    </div>
  );
};

export default Landing;
