import React from "react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  TbUserPlus,
  TbFileUpload,
  TbListDetails,
  TbBrain,
  TbBulb,
} from "react-icons/tb";

const BentoGrid = ({ className, children }) => (
  <div
    className={cn(
      "grid md:auto-rows-[18rem] grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto",
      className
    )}
  >
    {children}
  </div>
);

const AnimatedIcon = ({ children, animateProps }) => (
  <motion.div
    className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center border border-primary/20 group-hover/bento:bg-primary/20 transition-colors"
    {...animateProps}
  >
    {children}
  </motion.div>
);

const BentoGridItem = ({
  className,
  title,
  description,
  header,
  icon,
  badge,
  animateProps,
}) => (
  <motion.div
    className={cn(
      "row-span-1 rounded-2xl group/bento hover:shadow-lg transition-all duration-300 shadow shadow-border/30 p-4 bg-card border border-border/60 hover:border-border/80 justify-between flex flex-col backdrop-blur-sm overflow-hidden",
      className
    )}
    whileHover={{ y: -2 }}
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
  >
    {header}
    <div className="group-hover/bento:translate-x-1 transition-transform duration-300 flex-1 flex flex-col justify-end">
      <div className="flex items-center justify-between mb-3">
        <AnimatedIcon animateProps={animateProps}>{icon}</AnimatedIcon>
        {badge && (
          <Badge
            variant="secondary"
            className="bg-secondary/60 border-border/40 text-foreground/80 text-xs font-medium px-2 py-1"
          >
            {badge}
          </Badge>
        )}
      </div>
      <div className="font-bold text-foreground mb-2 text-sm md:text-base line-clamp-2">
        {title}
      </div>
      <div className="font-normal text-muted-foreground text-xs leading-relaxed line-clamp-3">
        {description}
      </div>
    </div>
  </motion.div>
);

const Features = () => {
  const features = [
    {
      title: "Effortless Onboarding",
      description:
        "Sign up and build your profile in seconds. Upload your resume and let AI do the rest.",
      header: <FeatureHeader1 />,
      icon: <TbUserPlus className="w-6 h-6 text-primary" />,
      animateProps: {
        animate: { scale: [1, 1.15, 1] },
        transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
      },
      className: "md:col-span-1",
    },
    {
      title: "Smart Resume Parsing",
      description:
        "Upload your PDF resume and our LLM-powered parser extracts your skills and experience.",
      header: <FeatureHeader2 />,
      icon: <TbFileUpload className="w-6 h-6 text-primary" />,
      animateProps: {
        animate: { y: [0, -6, 0] },
        transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
      },
      className: "md:col-span-1",
    },
    {
      title: "Curated Job Listings",
      description:
        "Personalized job recommendations with instant apply and wishlist features.",
      header: <FeatureHeader3 />,
      icon: <TbListDetails className="w-6 h-6 text-primary" />,
      animateProps: {
        animate: { rotate: [0, 8, -8, 0] },
        transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
      },
      className: "md:col-span-1",
    },
    {
      title: "AI Job Readiness",
      description:
        "Get instant feedback on your fit for any job and a personalized roadmap to improve.",
      header: <FeatureHeader4 />,
      icon: <TbBrain className="w-6 h-6 text-primary" />,
      animateProps: {
        animate: { scale: [1, 1.08, 1], rotate: [0, 2, -2, 0] },
        transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
      },
      className: "md:col-span-2",
    },
    {
      title: "Project-Based Learning",
      description:
        "AI suggests real-world projects and resources to boost your skills for your dream job.",
      header: <FeatureHeader5 />,
      icon: <TbBulb className="w-6 h-6 text-primary" />,
      animateProps: {
        animate: {
          scale: [1, 1.2, 1],
          color: ["#7c3aed", "#facc15", "#7c3aed"],
        },
        transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
      },
      className: "md:col-span-1",
    },
  ];

  return (
    <section id="features" className="py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge
            variant="secondary"
            className="mb-6 bg-secondary/60 border-border/40 text-foreground/80 px-6 py-2 rounded-full"
          >
            Features
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground tracking-tight">
            Everything you need to <span className="text-primary">grow</span>
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            From onboarding to analytics, Zenith gives you the tools to land
            your dream job and upskill with AI.
          </p>
        </motion.div>

        <BentoGrid>
          {features.map((item, i) => (
            <BentoGridItem
              key={i}
              title={item.title}
              description={item.description}
              header={item.header}
              icon={item.icon}
              badge={item.badge}
              className={item.className}
              animateProps={item.animateProps}
            />
          ))}
        </BentoGrid>
      </div>
    </section>
  );
};

// Minimal, theme-matching headers
const FeatureHeader1 = () => (
  <div className="flex flex-1 w-full h-full min-h-[4rem] max-h-[6rem] rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 overflow-hidden relative" />
);
const FeatureHeader2 = () => (
  <div className="flex flex-1 w-full h-full min-h-[4rem] max-h-[6rem] rounded-lg bg-gradient-to-br from-secondary/10 to-accent/10 border border-secondary/20 overflow-hidden relative" />
);
const FeatureHeader3 = () => (
  <div className="flex flex-1 w-full h-full min-h-[4rem] max-h-[6rem] rounded-lg bg-gradient-to-br from-accent/10 to-primary/10 border border-accent/20 overflow-hidden relative" />
);
const FeatureHeader4 = () => (
  <div className="flex flex-1 w-full h-full min-h-[4rem] max-h-[6rem] rounded-lg bg-gradient-to-br from-primary/10 to-muted/10 border border-primary/20 overflow-hidden relative" />
);
const FeatureHeader5 = () => (
  <div className="flex flex-1 w-full h-full min-h-[4rem] max-h-[6rem] rounded-lg bg-gradient-to-br from-accent/10 to-secondary/10 border border-accent/20 overflow-hidden relative" />
);

export default Features;
