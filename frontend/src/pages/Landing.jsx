import React from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";

const Landing = () => {
  return (
    <div className="bg-background min-h-screen">
      <Navbar />
      <main className="pt-24">
        <HeroSection />
      </main>
    </div>
  );
};

export default Landing;