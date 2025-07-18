import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MoveRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

function DemoGradientContainer() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 1.2 }}
      className="relative z-10 mt-12 rounded-3xl border border-border bg-background p-4 shadow-md"
    >
      {/* Center and top gradients */}
      <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-[60%] h-16 z-0 pointer-events-none">
        <div className="w-full h-full bg-gradient-to-br from-primary/30 via-secondary/20 to-accent/20 blur-2xl rounded-3xl" />
      </div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40%] h-12 z-0 pointer-events-none">
        <div className="w-full h-full bg-gradient-to-r from-primary/20 via-secondary/10 to-accent/20 blur-2xl rounded-3xl" />
      </div>
      <div className="w-full overflow-hidden rounded-xl border border-border">
        <img
          src="/dashboard.png"
          alt="Demo placeholder"
          className="aspect-[16/9] h-auto w-full object-fit"
        />
      </div>
    </motion.div>
  );
}

function HeroSection() {
  const navigate = useNavigate();
  const [titleNumber, setTitleNumber] = useState(0);
  const titles = useMemo(
    () => ["amazing", "new", "wonderful", "beautiful", "smart"],
    []
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setTitleNumber((prev) => (prev === titles.length - 1 ? 0 : prev + 1));
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [titleNumber, titles]);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="relative mx-auto my-10 flex max-w-5xl flex-col items-center justify-center">
      <div className="px-4 py-10 md:py-16 w-full">
        <h1 className="relative z-10 mx-auto max-w-5xl text-center text-2xl font-bold text-foreground md:text-4xl lg:text-6xl">
          {"Upskill for your dream job with".split(" ").map((word, index) => (
            <motion.span
              key={index}
              initial={{ opacity: 0, filter: "blur(4px)", y: 10 }}
              animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
              transition={{
                duration: 0.3,
                delay: index * 0.08,
                ease: "easeInOut",
              }}
              className="mr-2 inline-block"
            >
              {word}
            </motion.span>
          ))}
          <span className="relative flex w-full justify-center overflow-hidden text-center md:pb-4 md:pt-1">
            &nbsp;
            {titles.map((title, index) => (
              <motion.span
                key={index}
                className="absolute font-semibold text-primary"
                initial={{ opacity: 0, y: "-100" }}
                transition={{ type: "spring", stiffness: 50 }}
                animate={
                  titleNumber === index
                    ? { y: 0, opacity: 1 }
                    : { y: titleNumber > index ? -150 : 150, opacity: 0 }
                }
              >
                {title}
              </motion.span>
            ))}
          </span>
        </h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.8 }}
          className="relative z-10 mx-auto max-w-xl py-4 text-center text-lg font-normal text-muted-foreground"
        >
          Zenith is your platform to learn, grow, and land your dream job.
          Explore curated resources, real-world projects, and connect with top
          employers.
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 1 }}
          className="relative z-10 mt-8 flex flex-wrap items-center justify-center gap-4"
        >
          <Button
            size="lg"
            className="w-60 gap-2"
            variant="default"
            onClick={() => {
              navigate("/login");
            }}
          >
            Get Started <MoveRight className="w-4 h-4" />
          </Button>
          <Button
            size="lg"
            className="w-60 gap-2"
            variant="outline"
            onClick={() => scrollToSection("features")}
          >
            Learn More
          </Button>
        </motion.div>
        <DemoGradientContainer />
      </div>
    </div>
  );
}

export default HeroSection;
