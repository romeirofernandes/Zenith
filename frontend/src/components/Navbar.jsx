import React, { useState, useRef } from "react";
import {
  motion,
  useScroll,
  useMotionValueEvent,
  AnimatePresence,
} from "framer-motion";
import { RiMenu4Line, RiCloseLine } from "react-icons/ri";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const ref = useRef(null);
  const { scrollY } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const [visible, setVisible] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setVisible(latest > 100);
  });

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setMobileMenuOpen(false);
  };

  // Remove border/shadow at top, add when scrolled
  const borderClass = visible ? "border border-border shadow-sm" : "";

  return (
    <motion.div
      ref={ref}
      className="fixed inset-x-0 top-0 z-50 max-w-5xl mx-auto"
    >
      {/* Desktop Navbar */}
      <motion.div
        animate={{
          backdropFilter: visible ? "blur(10px)" : "none",
          border: visible ? "1px solid rgba(56, 56, 56, 0.3)" : "none",
          width: visible ? "90%" : "100%",
          y: visible ? 20 : 0,
          backgroundColor: visible
            ? "rgba(255,255,255,0.85)"
            : "rgba(255,255,255,0)",
        }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 50,
        }}
        className={`relative z-[60] mx-auto hidden w-full max-w-5xl flex-row items-center justify-between rounded-lg px-6 py-4 md:flex ${borderClass}`}
      >
        <div className="flex w-full items-center justify-between">
          <motion.h1
            animate={{
              scale: visible ? 0.9 : 1,
            }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
            }}
            className="text-2xl font-bold text-primary"
          >
            zenith.
          </motion.h1>

          <motion.nav
            animate={{
              opacity: 1,
            }}
            className="absolute left-1/2 flex -translate-x-1/2 items-center space-x-6"
          >
            {["Features", "Testimonials"].map((item, idx) => (
              <motion.button
                key={idx}
                onClick={() => scrollToSection(item.toLowerCase())}
                className="text-muted-foreground hover:text-primary relative px-4 py-2 font-medium"
                whileHover={{ scale: 1.05 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 17,
                }}
              >
                {item}
              </motion.button>
            ))}
          </motion.nav>
          <Button size="sm" className="ml-auto">
            Get Started
          </Button>
        </div>
      </motion.div>

      {/* Mobile navbar */}
      <motion.div
        animate={{
          backdropFilter: visible ? "blur(10px)" : "none",
          border: visible ? "1px solid rgba(56, 56, 56, 0.3)" : "none",
          y: visible ? 20 : 0,
          backgroundColor: visible
            ? "rgba(255,255,255,0.85)"
            : "rgba(255,255,255,0)",
        }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 50,
        }}
        className={`md:hidden flex items-center justify-between px-6 py-4 mt-4 mx-4 rounded-lg ${borderClass}`}
      >
        <motion.h1
          animate={{
            scale: visible ? 0.9 : 1,
          }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
          }}
          className="text-xl font-bold text-primary"
        >
          Zenith
        </motion.h1>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-primary text-2xl p-1"
        >
          {mobileMenuOpen ? <RiCloseLine /> : <RiMenu4Line />}
        </button>
      </motion.div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
            className="md:hidden absolute top-full left-0 right-0 mt-2 mx-4"
          >
            <div className="bg-white/95 backdrop-blur-lg border border-border rounded-lg p-4 space-y-4 shadow-lg">
              {["Features", "Testimonials"].map((item, idx) => (
                <motion.button
                  key={idx}
                  onClick={() => scrollToSection(item.toLowerCase())}
                  className="block w-full text-left text-muted-foreground hover:text-primary py-2 px-3 rounded-md hover:bg-primary/10 transition-colors font-medium"
                  whileTap={{ scale: 0.95 }}
                >
                  {item}
                </motion.button>
              ))}
              <Button size="sm" className="w-full mt-2">
                Get Started
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Navbar;
