import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Send,
  Zap,
  MapPin,
  ChevronDown,
  ChevronRight,
  Copy,
  Download,
  Target,
  Mail,
  Building,
  Code,
  Lightbulb,
  TrendingUp,
  Clock,
  Star,
  RefreshCw,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import mermaid from "mermaid";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// Initialize Mermaid with optimized configuration for faster rendering
mermaid.initialize({
  startOnLoad: false,
  theme: "default",
  securityLevel: "loose",
  fontFamily: "inherit",
  flowchart: {
    useMaxWidth: true,
    htmlLabels: false, // Disable HTML labels for faster rendering
    curve: "basis",
  },
  themeCSS: `
    .node rect { 
      fill: #f8fafc; 
      stroke: #3b82f6; 
      stroke-width: 2px; 
      rx: 8px;
    }
    .node text { 
      font-size: 12px; 
      fill: #1e293b;
    }
    .edgePath .path { 
      stroke: #6b7280; 
      stroke-width: 2px; 
    }
    .edgeLabel { 
      background-color: #ffffff; 
      font-size: 10px;
    }
  `,
});

const STORAGE_KEY = "coldEmailData";

const ColdEmail = () => {
  const [formData, setFormData] = useState({
    startupName: "",
    website: "",
    industry: "",
    targetRole: "",
    founderName: "",
    founderEmail: "",
    additionalInfo: "",
  });

  const [results, setResults] = useState({
    roadmap: [],
    extraFeatures: [],
    coldEmail: "",
    mermaidChart: "",
    techStack: [],
    timeline: "",
    marketAnalysis: "",
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [expandedSteps, setExpandedSteps] = useState(new Set());

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.formData) {
          setFormData(parsed.formData);
        }
        if (parsed.results) {
          setResults(parsed.results);

          // Re-render Mermaid chart if it exists with optimized timing
          if (parsed.results.mermaidChart) {
            setTimeout(() => {
              renderMermaidChart(parsed.results.mermaidChart);
            }, 100); // Reduced from 500ms
          }
        }
      } catch (error) {
        console.error("Error loading saved data:", error);
      }
    }
  }, []);

  // Save data to localStorage whenever formData or results change
  useEffect(() => {
    if (formData.startupName || results.roadmap.length > 0) {
      const dataToSave = { formData, results };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    }
  }, [formData, results]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const resetData = () => {
    const emptyFormData = {
      startupName: "",
      website: "",
      industry: "",
      targetRole: "",
      founderName: "",
      founderEmail: "",
      additionalInfo: "",
    };
    const emptyResults = {
      roadmap: [],
      extraFeatures: [],
      coldEmail: "",
      mermaidChart: "",
      techStack: [],
      timeline: "",
      marketAnalysis: "",
    };

    setFormData(emptyFormData);
    setResults(emptyResults);
    setExpandedSteps(new Set());
    localStorage.removeItem(STORAGE_KEY);

    // Clear mermaid container
    const container = document.getElementById("mermaid-container");
    if (container) {
      container.innerHTML =
        '<p class="text-muted-foreground text-center">Chart will render here...</p>';
    }

    toast.success("Data cleared successfully!");
  };

  // Helper function to ensure arrays
  const ensureArray = (data) => {
    if (Array.isArray(data)) return data;
    if (typeof data === "string")
      return data
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    return [];
  };

  // Helper function to ensure object has required properties
  const normalizeResults = (data) => {
    return {
      roadmap: ensureArray(data.roadmap || []),
      extraFeatures: ensureArray(data.extraFeatures || []),
      coldEmail: data.coldEmail || "",
      mermaidChart: data.mermaidChart || "",
      techStack: ensureArray(data.techStack || []),
      timeline: data.timeline || "14 days",
      marketAnalysis: data.marketAnalysis || "",
    };
  };

  const renderMermaidChart = async (chartCode) => {
    try {
      const container = document.getElementById("mermaid-container");
      if (!container) return;

      console.log("Rendering Mermaid chart:", chartCode);

      // Clear previous content immediately
      container.innerHTML =
        '<div class="text-center py-4"><div class="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto"></div><p class="text-xs text-muted-foreground mt-2">Rendering chart...</p></div>';

      // Create a unique ID for this chart
      const chartId = `mermaid-chart-${Date.now()}`;

      // Use mermaid.render method with error handling
      const { svg } = await mermaid.render(chartId, chartCode);

      // Set the SVG content immediately
      container.innerHTML = svg;

      console.log("Mermaid chart rendered successfully");
    } catch (error) {
      console.error("Mermaid render error:", error);
      const container = document.getElementById("mermaid-container");
      if (container) {
        container.innerHTML = `
          <div class="text-center py-8">
            <p class="text-muted-foreground mb-2">Chart rendering failed</p>
            <p class="text-xs text-muted-foreground">Please try regenerating the strategy</p>
          </div>
        `;
      }
    }
  };

  const generateWithGemini = async () => {
    if (!formData.startupName || !formData.website) {
      toast.error("Please fill in startup name and website");
      return;
    }

    setIsGenerating(true);

    try {
      const prompt = `
You are an expert product strategist and business analyst. Analyze the startup "${
        formData.startupName
      }" at ${
        formData.website
      } and create a RAPID DEVELOPMENT STRATEGY that can be completed in exactly 14 days by a skilled developer.

Focus on creating a minimal viable competitor. Respond with a clean JSON structure (no markdown, no code blocks):

{
  "roadmap": [
    {
      "name": "Day 1-2: Market Research & MVP Planning",
      "duration": "2 days",
      "objectives": "Quick competitor analysis and define core features for MVP",
      "requirements": "Research tools, basic wireframing",
      "deliverables": "Feature list, basic wireframes, tech stack decision"
    },
    {
      "name": "Day 3-4: Project Setup & Architecture",
      "duration": "2 days",
      "objectives": "Set up development environment and basic structure",
      "requirements": "Development tools, hosting setup",
      "deliverables": "Working environment, basic routing, database schema"
    },
    {
      "name": "Day 5-7: Core Feature Development",
      "duration": "3 days",
      "objectives": "Implement main functionality",
      "requirements": "Frontend and backend development",
      "deliverables": "Core features working"
    },
    {
      "name": "Day 8-10: UI/UX Implementation",
      "duration": "3 days",
      "objectives": "Design and implement user interface",
      "requirements": "UI components, styling",
      "deliverables": "Polished user interface"
    },
    {
      "name": "Day 11-12: Testing & Bug Fixes",
      "duration": "2 days",
      "objectives": "Test functionality and fix issues",
      "requirements": "Testing tools",
      "deliverables": "Stable application"
    },
    {
      "name": "Day 13-14: Deployment & Launch",
      "duration": "2 days",
      "objectives": "Deploy to production and launch",
      "requirements": "Hosting service, domain",
      "deliverables": "Live application"
    }
  ],
  "extraFeatures": [
    "AI-powered suggestions",
    "Advanced analytics dashboard",
    "Mobile-first design",
    "API integrations",
    "Real-time notifications"
  ],
  "techStack": [
    "React/Next.js",
    "Node.js/Express",
    "PostgreSQL/Supabase",
    "Tailwind CSS",
    "Vercel/Netlify"
  ],
  "timeline": "14 days",
  "marketAnalysis": "Brief analysis of market position and opportunities for ${
    formData.startupName
  }...",
  "mermaidChart": "graph TB\\n    A[Day 1-2: Research] --> B[Day 3-4: Setup]\\n    B --> C[Day 5-7: Core Features]\\n    C --> D[Day 8-10: UI Implementation]\\n    D --> E[Day 11-12: Testing]\\n    E --> F[Day 13-14: Deployment]\\n    \\n    style A fill:#e1f5fe\\n    style B fill:#f3e5f5\\n    style C fill:#e8f5e8\\n    style D fill:#fff3e0\\n    style E fill:#fce4ec\\n    style F fill:#e0f2f1",
  "coldEmail": "Subject: Built a ${formData.startupName} competitor - Seeking ${
        formData.targetRole || "developer"
      } opportunity\\n\\nHi ${
        formData.founderName || "[Founder Name]"
      },\\n\\nI'm a ${
        formData.targetRole || "developer"
      } who's been genuinely impressed by ${
        formData.startupName
      }'s approach to [specific area]. To demonstrate my skills and understanding of your market, I built a competitive analysis and functional prototype.\\n\\nMy version includes your core features plus additional innovations like:\\n• [Feature 1 from analysis]\\n• [Feature 2 from analysis]\\n• [Feature 3 from analysis]\\n\\nI'd love to discuss how my rapid development skills and fresh perspective could contribute to ${
        formData.startupName
      }'s growth. The prototype showcases my ability to quickly understand complex products and execute efficiently.\\n\\nWould you be open to a brief call to discuss potential opportunities?\\n\\nBest regards,\\n[Your Name]\\n\\nP.S. Happy to share the prototype and technical breakdown if you're interested."
}

Industry: ${formData.industry || "Tech"}
Target Role: ${formData.targetRole || "Software Engineer"}  
Additional Context: ${formData.additionalInfo}

IMPORTANT: 
- Create exactly 6 roadmap phases covering 14 days total
- Each phase should be 2-3 days maximum
- Focus on MVP features that can realistically be built quickly
- Provide clean JSON only, no markdown formatting or code blocks
- Escape newlines properly in JSON strings using \\n
- Make sure mermaidChart is a valid mermaid flowchart syntax
`;

      console.log("Sending request to Gemini API...");

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${
          import.meta.env.VITE_GEMINI_API_KEY
        }`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 8192,
            },
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Gemini API Error:", errorText);
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log("Full Gemini API Response:", data);

      if (
        !data.candidates ||
        !data.candidates[0] ||
        !data.candidates[0].content
      ) {
        throw new Error("Invalid API response structure");
      }

      const content = data.candidates[0].content.parts[0].text;
      console.log("Generated Content:", content);

      // Enhanced JSON parsing with better error handling
      let parsedResults = null;

      // Clean the content first
      let cleanContent = content.trim();

      // Remove any markdown code block formatting
      cleanContent = cleanContent
        .replace(/```json\s*/g, "")
        .replace(/```\s*$/g, "")
        .replace(/^```/g, "")
        .replace(/```$/g, "");

      // Try parsing strategies
      try {
        // Strategy 1: Direct parse
        parsedResults = JSON.parse(cleanContent);
        console.log("Direct JSON parse successful");
      } catch (e) {
        console.log("Direct JSON parse failed:", e.message);

        try {
          // Strategy 2: Extract JSON object from text
          const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            parsedResults = JSON.parse(jsonMatch[0]);
            console.log("Regex JSON parse successful");
          }
        } catch (e2) {
          console.log("Regex JSON parse failed:", e2.message);

          // Strategy 3: Create fallback with proper cold email
          const fallbackData = {
            roadmap: [
              {
                name: "Day 1-2: Market Research & Planning",
                duration: "2 days",
                objectives: "Analyze competitor and define MVP features",
                requirements: "Research tools, wireframing software",
                deliverables: "Feature list, wireframes, tech stack decision",
              },
              {
                name: "Day 3-4: Project Setup & Architecture",
                duration: "2 days",
                objectives:
                  "Set up development environment and basic structure",
                requirements: "Development tools, hosting setup",
                deliverables:
                  "Working environment, basic routing, database schema",
              },
              {
                name: "Day 5-7: Core Feature Development",
                duration: "3 days",
                objectives: "Implement main functionality",
                requirements: "Frontend and backend development",
                deliverables: "Core features working",
              },
              {
                name: "Day 8-10: UI/UX Implementation",
                duration: "3 days",
                objectives: "Design and implement user interface",
                requirements: "UI components, styling",
                deliverables: "Polished user interface",
              },
              {
                name: "Day 11-12: Testing & Bug Fixes",
                duration: "2 days",
                objectives: "Test functionality and fix issues",
                requirements: "Testing tools",
                deliverables: "Stable application",
              },
              {
                name: "Day 13-14: Deployment & Launch",
                duration: "2 days",
                objectives: "Deploy to production and launch",
                requirements: "Hosting service, domain",
                deliverables: "Live application",
              },
            ],
            extraFeatures: [
              "AI-powered suggestions",
              "Advanced analytics dashboard",
              "Mobile-first design",
              "API integrations",
              "Real-time notifications",
            ],
            techStack: [
              "React/Next.js",
              "Node.js/Express",
              "PostgreSQL/Supabase",
              "Tailwind CSS",
              "Vercel/Netlify",
            ],
            timeline: "14 days",
            marketAnalysis: `Analysis of ${
              formData.startupName
            }: This startup operates in the ${
              formData.industry || "tech"
            } space. By building a competitor with additional features, we can identify market gaps and demonstrate technical capabilities to potential employers.`,
            mermaidChart: `graph TB
    A[Day 1-2: Research] --> B[Day 3-4: Setup]
    B --> C[Day 5-7: Core Features]
    C --> D[Day 8-10: UI Implementation]
    D --> E[Day 11-12: Testing]
    E --> F[Day 13-14: Deployment]
    
    style A fill:#e1f5fe
    style B fill:#f3e5f5
    style C fill:#e8f5e8
    style D fill:#fff3e0
    style E fill:#fce4ec
    style F fill:#e0f2f1`,
            coldEmail: `Subject: Built a ${
              formData.startupName
            } competitor - Seeking ${
              formData.targetRole || "developer"
            } opportunity

Hi ${formData.founderName || "[Founder Name]"},

I'm a ${formData.targetRole || "developer"} who's been genuinely impressed by ${
              formData.startupName
            }'s innovative approach to ${
              formData.industry || "your industry"
            }. To demonstrate my skills and understanding of your market, I built a competitive analysis and functional prototype.

My version includes your core features plus additional innovations like:
• Advanced analytics dashboard with real-time insights
• AI-powered user recommendations
• Enhanced mobile experience with offline capabilities

The prototype showcases my ability to quickly understand complex products and execute efficiently. I'd love to discuss how my rapid development skills and fresh perspective could contribute to ${
              formData.startupName
            }'s growth.

Would you be open to a brief call to explore potential opportunities?

Best regards,
[Your Name]

P.S. I'd be happy to share the prototype and technical breakdown if you're interested in seeing the implementation details.`,
          };

          parsedResults = fallbackData;
          console.log("Using fallback data structure");
          toast.error(
            "AI response parsing failed, using fallback structure. Please try regenerating for better results."
          );
        }
      }

      if (!parsedResults) {
        throw new Error("Failed to parse AI response as JSON");
      }

      console.log("Parsed Results:", parsedResults);

      // Normalize and validate the results
      const normalizedResults = normalizeResults(parsedResults);
      console.log("Normalized Results:", normalizedResults);

      setResults(normalizedResults);

      // Render Mermaid chart if available with faster timing
      if (normalizedResults.mermaidChart) {
        setTimeout(() => {
          renderMermaidChart(normalizedResults.mermaidChart);
        }, 200); // Reduced from 1000ms
      }

      toast.success("Strategy generated successfully!");
    } catch (error) {
      console.error("Error generating content:", error);
      toast.error(`Failed to generate strategy: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleStep = (stepIndex) => {
    setExpandedSteps((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(stepIndex)) {
        newSet.delete(stepIndex);
      } else {
        newSet.add(stepIndex);
      }
      return newSet;
    });
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy to clipboard");
    }
  };

  const downloadAsPDF = async () => {
    if (!results.roadmap.length) {
      toast.error("No strategy to export. Please generate a strategy first.");
      return;
    }

    setIsExporting(true);
    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPosition = 20;

      // Helper function to add new page if needed
      const checkNewPage = (requiredSpace = 20) => {
        if (yPosition + requiredSpace > pageHeight - 20) {
          pdf.addPage();
          yPosition = 20;
        }
      };

      // Title
      pdf.setFontSize(24);
      pdf.setFont(undefined, "bold");
      pdf.text(`${formData.startupName} Competitor Strategy`, 20, yPosition);
      yPosition += 15;

      // Subtitle with timeline
      pdf.setFontSize(14);
      pdf.setFont(undefined, "normal");
      pdf.text(`Development Timeline: ${results.timeline}`, 20, yPosition);
      yPosition += 15;

      // Company details
      pdf.setFontSize(12);
      pdf.setFont(undefined, "bold");
      pdf.text("Target Company Details:", 20, yPosition);
      yPosition += 8;

      pdf.setFont(undefined, "normal");
      pdf.text(`Company: ${formData.startupName}`, 25, yPosition);
      yPosition += 6;
      pdf.text(`Website: ${formData.website}`, 25, yPosition);
      yPosition += 6;
      if (formData.industry) {
        pdf.text(`Industry: ${formData.industry}`, 25, yPosition);
        yPosition += 6;
      }
      if (formData.targetRole) {
        pdf.text(`Target Role: ${formData.targetRole}`, 25, yPosition);
        yPosition += 6;
      }
      yPosition += 10;

      // Development Roadmap
      checkNewPage(30);
      pdf.setFontSize(16);
      pdf.setFont(undefined, "bold");
      pdf.text("Development Roadmap", 20, yPosition);
      yPosition += 12;

      results.roadmap.forEach((phase, index) => {
        checkNewPage(25);

        // Phase title
        pdf.setFontSize(12);
        pdf.setFont(undefined, "bold");
        pdf.text(`${index + 1}. ${phase.name}`, 20, yPosition);
        yPosition += 8;

        // Phase details
        pdf.setFontSize(10);
        pdf.setFont(undefined, "normal");

        if (phase.duration) {
          pdf.text(`Duration: ${phase.duration}`, 25, yPosition);
          yPosition += 5;
        }

        if (phase.objectives) {
          const objectivesLines = pdf.splitTextToSize(
            `Objectives: ${phase.objectives}`,
            pageWidth - 50
          );
          pdf.text(objectivesLines, 25, yPosition);
          yPosition += objectivesLines.length * 5;
        }

        if (phase.requirements) {
          const reqLines = pdf.splitTextToSize(
            `Requirements: ${phase.requirements}`,
            pageWidth - 50
          );
          pdf.text(reqLines, 25, yPosition);
          yPosition += reqLines.length * 5;
        }

        if (phase.deliverables) {
          const delLines = pdf.splitTextToSize(
            `Deliverables: ${phase.deliverables}`,
            pageWidth - 50
          );
          pdf.text(delLines, 25, yPosition);
          yPosition += delLines.length * 5;
        }

        yPosition += 8;
      });

      // Competitive Edge Features
      checkNewPage(20);
      pdf.setFontSize(16);
      pdf.setFont(undefined, "bold");
      pdf.text("Competitive Edge Features", 20, yPosition);
      yPosition += 10;

      pdf.setFontSize(10);
      pdf.setFont(undefined, "normal");
      results.extraFeatures.forEach((feature) => {
        checkNewPage(6);
        pdf.text(`• ${feature}`, 25, yPosition);
        yPosition += 6;
      });
      yPosition += 10;

      // Tech Stack
      checkNewPage(20);
      pdf.setFontSize(16);
      pdf.setFont(undefined, "bold");
      pdf.text("Recommended Tech Stack", 20, yPosition);
      yPosition += 10;

      pdf.setFontSize(10);
      pdf.setFont(undefined, "normal");
      results.techStack.forEach((tech) => {
        checkNewPage(6);
        pdf.text(`• ${tech}`, 25, yPosition);
        yPosition += 6;
      });
      yPosition += 10;

      // Market Analysis
      if (results.marketAnalysis) {
        checkNewPage(20);
        pdf.setFontSize(16);
        pdf.setFont(undefined, "bold");
        pdf.text("Market Analysis", 20, yPosition);
        yPosition += 10;

        pdf.setFontSize(10);
        pdf.setFont(undefined, "normal");
        const analysisLines = pdf.splitTextToSize(
          results.marketAnalysis,
          pageWidth - 40
        );

        analysisLines.forEach((line) => {
          checkNewPage(6);
          pdf.text(line, 20, yPosition);
          yPosition += 6;
        });
        yPosition += 10;
      }

      // Cold Email Template
      if (results.coldEmail) {
        checkNewPage(20);
        pdf.setFontSize(16);
        pdf.setFont(undefined, "bold");
        pdf.text("Cold Email Template", 20, yPosition);
        yPosition += 10;

        pdf.setFontSize(10);
        pdf.setFont(undefined, "normal");
        const emailLines = pdf.splitTextToSize(
          results.coldEmail,
          pageWidth - 40
        );

        emailLines.forEach((line) => {
          checkNewPage(6);
          pdf.text(line, 20, yPosition);
          yPosition += 6;
        });
      }

      // Capture and add Mermaid chart if it exists
      const mermaidContainer = document.getElementById("mermaid-container");
      if (mermaidContainer && mermaidContainer.querySelector("svg")) {
        try {
          checkNewPage(100);
          pdf.setFontSize(16);
          pdf.setFont(undefined, "bold");
          pdf.text("Development Flow Chart", 20, yPosition);
          yPosition += 15;

          const canvas = await html2canvas(mermaidContainer, {
            backgroundColor: "#ffffff",
            scale: 2,
          });

          const imgData = canvas.toDataURL("image/png");
          const imgWidth = pageWidth - 40;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;

          pdf.addImage(imgData, "PNG", 20, yPosition, imgWidth, imgHeight);
        } catch (error) {
          console.error("Error adding chart to PDF:", error);
        }
      }

      // Save the PDF
      pdf.save(`${formData.startupName}_Strategy.pdf`);
      toast.success("Strategy exported as PDF successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to export PDF. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="flex-shrink-0 bg-card border-b p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
              <Target className="w-6 h-6" />
              Strategy Generator
            </h1>
            <p className="text-muted-foreground text-sm">
              Build a competitor in days, get noticed by founders
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={resetData} variant="outline" size="sm">
              <RefreshCw className="w-3 h-3 mr-1" />
              Reset
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full flex">
          {/* Left Panel - Input Form */}
          <div className="w-1/3 border-r bg-card">
            <ScrollArea className="h-full">
              <div className="p-4">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  Target Details
                </h2>

                <div className="space-y-3">
                  <div>
                    <Label htmlFor="startupName" className="text-sm">
                      Startup Name *
                    </Label>
                    <Input
                      id="startupName"
                      placeholder="e.g., Notion, Figma, Stripe"
                      value={formData.startupName}
                      onChange={(e) =>
                        handleInputChange("startupName", e.target.value)
                      }
                      className="mt-1 text-sm"
                    />
                  </div>

                  <div>
                    <Label htmlFor="website" className="text-sm">
                      Website URL *
                    </Label>
                    <Input
                      id="website"
                      placeholder="https://notion.so"
                      value={formData.website}
                      onChange={(e) =>
                        handleInputChange("website", e.target.value)
                      }
                      className="mt-1 text-sm"
                    />
                  </div>

                  <div>
                    <Label htmlFor="industry" className="text-sm">
                      Industry
                    </Label>
                    <Input
                      id="industry"
                      placeholder="SaaS, E-commerce, Fintech"
                      value={formData.industry}
                      onChange={(e) =>
                        handleInputChange("industry", e.target.value)
                      }
                      className="mt-1 text-sm"
                    />
                  </div>

                  <div>
                    <Label htmlFor="targetRole" className="text-sm">
                      Target Role
                    </Label>
                    <Input
                      id="targetRole"
                      placeholder="Full Stack Engineer"
                      value={formData.targetRole}
                      onChange={(e) =>
                        handleInputChange("targetRole", e.target.value)
                      }
                      className="mt-1 text-sm"
                    />
                  </div>

                  <div>
                    <Label htmlFor="founderName" className="text-sm">
                      Founder Name
                    </Label>
                    <Input
                      id="founderName"
                      placeholder="Ivan Zhao"
                      value={formData.founderName}
                      onChange={(e) =>
                        handleInputChange("founderName", e.target.value)
                      }
                      className="mt-1 text-sm"
                    />
                  </div>

                  <div>
                    <Label htmlFor="founderEmail" className="text-sm">
                      Founder Email
                    </Label>
                    <Input
                      id="founderEmail"
                      placeholder="founder@startup.com"
                      value={formData.founderEmail}
                      onChange={(e) =>
                        handleInputChange("founderEmail", e.target.value)
                      }
                      className="mt-1 text-sm"
                    />
                  </div>

                  <div>
                    <Label htmlFor="additionalInfo" className="text-sm">
                      Additional Context
                    </Label>
                    <Textarea
                      id="additionalInfo"
                      placeholder="Any specific details about features, tech stack, or business model..."
                      value={formData.additionalInfo}
                      onChange={(e) =>
                        handleInputChange("additionalInfo", e.target.value)
                      }
                      className="mt-1 text-sm"
                      rows={3}
                    />
                  </div>

                  <Button
                    onClick={generateWithGemini}
                    disabled={isGenerating}
                    className="w-full mt-4"
                    size="sm"
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                        Generating Plan...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        Generate Strategy
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </ScrollArea>
          </div>

          {/* Right Panel - Results */}
          <div className="flex-1 bg-background">
            <ScrollArea className="h-full">
              <div className="p-4">
                {!results.roadmap.length && !isGenerating && (
                  <div className="flex items-center justify-center h-64 text-muted-foreground">
                    <div className="text-center">
                      <Target className="w-10 h-10 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">
                        Fill in the details and generate your strategy
                      </p>
                    </div>
                  </div>
                )}

                {results.roadmap.length > 0 && (
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-bold">
                        {formData.startupName} Strategy
                      </h2>
                      <Button
                        onClick={downloadAsPDF}
                        disabled={isExporting}
                        variant="outline"
                        size="sm"
                      >
                        {isExporting ? (
                          <>
                            <div className="animate-spin w-3 h-3 border-2 border-current border-t-transparent rounded-full mr-1" />
                            Exporting...
                          </>
                        ) : (
                          <>
                            <FileText className="w-4 h-4 mr-1" />
                            Export PDF
                          </>
                        )}
                      </Button>
                    </div>

                    <Tabs defaultValue="roadmap" className="w-full">
                      <TabsList className="grid w-full grid-cols-5 text-xs">
                        <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
                        <TabsTrigger value="flowchart">Chart</TabsTrigger>
                        <TabsTrigger value="features">Features</TabsTrigger>
                        <TabsTrigger value="analysis">Analysis</TabsTrigger>
                        <TabsTrigger value="email">Email</TabsTrigger>
                      </TabsList>

                      <TabsContent value="roadmap" className="space-y-3 mt-4">
                        <div className="flex items-center gap-2 mb-3">
                          <MapPin className="w-4 h-4 text-primary" />
                          <h3 className="font-semibold">Development Plan</h3>
                          <Badge
                            variant="secondary"
                            className="text-xs bg-green-100 text-green-700"
                          >
                            {results.timeline}
                          </Badge>
                        </div>

                        <div className="space-y-2">
                          {results.roadmap.map((phase, index) => (
                            <Collapsible key={index}>
                              <CollapsibleTrigger
                                className="w-full"
                                onClick={() => toggleStep(index)}
                              >
                                <Card className="hover:shadow-sm transition-shadow cursor-pointer">
                                  <CardHeader className="pb-2 pt-3">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold">
                                          {index + 1}
                                        </div>
                                        <div className="text-left">
                                          <CardTitle className="text-sm">
                                            {phase.name}
                                          </CardTitle>
                                          {phase.duration && (
                                            <div className="flex items-center gap-1 mt-1">
                                              <Clock className="w-3 h-3 text-green-600" />
                                              <span className="text-xs text-green-600 font-medium">
                                                {phase.duration}
                                              </span>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                      {expandedSteps.has(index) ? (
                                        <ChevronDown className="w-4 h-4" />
                                      ) : (
                                        <ChevronRight className="w-4 h-4" />
                                      )}
                                    </div>
                                  </CardHeader>
                                </Card>
                              </CollapsibleTrigger>
                              <CollapsibleContent>
                                <Card className="ml-4 mt-1 border-l-2 border-l-primary">
                                  <CardContent className="pt-3 pb-3">
                                    <div className="space-y-2 text-xs">
                                      {phase.objectives && (
                                        <div>
                                          <h4 className="font-semibold text-muted-foreground uppercase tracking-wide">
                                            Objectives
                                          </h4>
                                          <p className="mt-1">
                                            {phase.objectives}
                                          </p>
                                        </div>
                                      )}
                                      {phase.requirements && (
                                        <div>
                                          <h4 className="font-semibold text-muted-foreground uppercase tracking-wide">
                                            Requirements
                                          </h4>
                                          <p className="mt-1">
                                            {phase.requirements}
                                          </p>
                                        </div>
                                      )}
                                      {phase.deliverables && (
                                        <div>
                                          <h4 className="font-semibold text-muted-foreground uppercase tracking-wide">
                                            Deliverables
                                          </h4>
                                          <p className="mt-1">
                                            {phase.deliverables}
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  </CardContent>
                                </Card>
                              </CollapsibleContent>
                            </Collapsible>
                          ))}
                        </div>
                      </TabsContent>

                      <TabsContent value="flowchart">
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-sm">
                              <MapPin className="w-4 h-4" />
                              Development Flow
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div
                              id="mermaid-container"
                              className="w-full min-h-[400px] border rounded p-4 bg-muted/5 flex items-center justify-center"
                            >
                              <p className="text-muted-foreground text-center">
                                Chart will render here...
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>

                      <TabsContent value="features" className="space-y-3">
                        <div className="grid grid-cols-1 gap-3">
                          <Card>
                            <CardHeader className="pb-3">
                              <CardTitle className="flex items-center gap-2 text-sm">
                                <Lightbulb className="w-4 h-4" />
                                Competitive Edge Features
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-2">
                                {results.extraFeatures.map((feature, index) => (
                                  <div
                                    key={index}
                                    className="flex items-start gap-2"
                                  >
                                    <Star className="w-3 h-3 text-yellow-500 mt-1 flex-shrink-0" />
                                    <p className="text-xs">{feature}</p>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardHeader className="pb-3">
                              <CardTitle className="flex items-center gap-2 text-sm">
                                <Code className="w-4 h-4" />
                                Recommended Tech Stack
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="flex flex-wrap gap-1">
                                {results.techStack.map((tech, index) => (
                                  <Badge
                                    key={index}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {tech}
                                  </Badge>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </TabsContent>

                      <TabsContent value="analysis">
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-sm">
                              <TrendingUp className="w-4 h-4" />
                              Market Analysis
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-xs whitespace-pre-wrap">
                              {results.marketAnalysis}
                            </p>
                          </CardContent>
                        </Card>
                      </TabsContent>

                      <TabsContent value="email">
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-sm">
                              <Mail className="w-4 h-4" />
                              Cold Email Template
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              <div className="bg-muted/50 p-3 rounded">
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <p className="text-xs text-muted-foreground">
                                      To:
                                    </p>
                                    <p className="text-sm font-medium">
                                      {formData.founderEmail ||
                                        "founder@startup.com"}
                                    </p>
                                  </div>
                                  <Button
                                    onClick={() =>
                                      copyToClipboard(results.coldEmail)
                                    }
                                    variant="outline"
                                    size="sm"
                                  >
                                    <Copy className="w-3 h-3 mr-1" />
                                    Copy
                                  </Button>
                                </div>
                                <div className="mt-3 p-3 bg-background rounded border">
                                  <div className="text-xs whitespace-pre-wrap">
                                    {results.coldEmail}
                                  </div>
                                </div>
                              </div>

                              <div className="flex gap-2">
                                <Button
                                  onClick={() =>
                                    window.open(
                                      `mailto:${
                                        formData.founderEmail
                                      }?subject=Built a ${
                                        formData.startupName
                                      } competitor - Seeking opportunity&body=${encodeURIComponent(
                                        results.coldEmail
                                      )}`
                                    )
                                  }
                                  className="flex-1"
                                  size="sm"
                                >
                                  <Send className="w-3 h-3 mr-1" />
                                  Send Email
                                </Button>
                                <Button
                                  onClick={() =>
                                    copyToClipboard(results.coldEmail)
                                  }
                                  variant="outline"
                                  size="sm"
                                >
                                  <Copy className="w-3 h-3 mr-1" />
                                  Copy
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>
                    </Tabs>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColdEmail;
