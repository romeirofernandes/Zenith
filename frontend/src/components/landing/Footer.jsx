import React from "react";
import { motion } from "framer-motion";

const Footer = () => {
  return (
    <footer className="max-w-4xl mx-auto relative mt-32 py-8">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="container mx-auto px-8 max-w-4xl"
      >
        <div className="flex flex-col gap-4 sm:flex-row justify-between items-center text-muted-foreground text-sm">
          <p>© {new Date().getFullYear()} Zenith. All rights reserved.</p>
          <p>crafted by Team SOS</p>
        </div>
      </motion.div>
    </footer>
  );
};

export default Footer;
