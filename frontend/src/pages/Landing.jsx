import React from "react";
import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import Features from "@/components/Features";
import Footer from "@/components/landing/Footer";

const Landing = () => {
  return (
    <div className="bg-background min-h-screen">
      <Navbar />
      <main className="pt-24">
        <HeroSection />
        <Features />
      </main>
      <Footer />
    </div>
  );
};

export default Landing;
