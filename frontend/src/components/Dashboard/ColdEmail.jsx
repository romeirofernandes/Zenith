<<<<<<< HEAD
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
  Sparkles,
  Target,
  Mail,
  Globe,
  Building,
  Users,
  Code,
  Lightbulb,
  TrendingUp,
  Clock,
  Star,
} from "lucide-react";
=======
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
>>>>>>> 9f258a72d5f49dbe8313b34cef4e3c08167fc416
import { toast } from "sonner";

const Card = ({ title, children }) => (
  <div className="bg-white border rounded-lg shadow p-4 flex flex-col gap-2">
    <h2 className="font-semibold text-lg mb-2">{title}</h2>
    {children}
  </div>
);

const ColdEmail = () => {
  const [formData, setFormData] = useState({
    startupName: "",
    website: "",
  });
<<<<<<< HEAD

  const [results, setResults] = useState({
    roadmap: [],
    extraFeatures: [],
    coldEmail: "",
    mermaidChart: "",
    techStack: [],
    timeline: "",
    marketAnalysis: "",
  });

=======
  const [result, setResult] = useState(null);
>>>>>>> 9f258a72d5f49dbe8313b34cef4e3c08167fc416
  const [isGenerating, setIsGenerating] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
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
      timeline: data.timeline || "",
      marketAnalysis: data.marketAnalysis || "",
    };
  };

  const generateWithGemini = async () => {
    if (!formData.startupName || !formData.website) {
      toast.error("Please fill in company name and website");
      return;
    }
    setIsGenerating(true);
    setResult(null);

    try {
      const prompt = `
<<<<<<< HEAD
You are an expert product strategist and business analyst. Analyze the startup "${
        formData.startupName
      }" at ${
        formData.website
      } and provide a JSON response with the following structure:

{
  "roadmap": [
    {
      "name": "Phase 1: Market Research & Analysis",
      "duration": "2-3 weeks",
      "objectives": "Understand market landscape and user needs",
      "requirements": "Research tools, competitor analysis framework",
      "deliverables": "Market analysis report, user persona documentation"
    }
  ],
  "extraFeatures": [
    "AI-powered feature suggestion",
    "Advanced analytics dashboard", 
    "Enhanced mobile experience"
  ],
  "techStack": [
    "React/Next.js",
    "Node.js/Express", 
    "PostgreSQL",
    "Redis",
    "AWS/Vercel"
  ],
  "timeline": "6-8 months",
  "marketAnalysis": "Brief market opportunity analysis...",
  "mermaidChart": "graph TB\\nA[Market Research] -.-> B[MVP Design]\\nB -.-> C[Development]\\nC -.-> D[Testing]",
  "coldEmail": "Subject: Impressed by ${
    formData.startupName
  } - Built a competitive analysis\\n\\nHi ${
        formData.founderName || "[Founder Name]"
      },\\n\\nI've been following ${
        formData.startupName
      } and am genuinely impressed by your approach to [specific feature]. As a ${
        formData.targetRole || "developer"
      } passionate about this space, I decided to build a competitive analysis and prototype.\\n\\nI'd love to discuss how my additional features like [mention 2-3 key innovations] could benefit your product strategy.\\n\\nWould you be open to a brief call?\\n\\nBest regards,\\n[Your Name]"
}

Industry: ${formData.industry || "Tech"}
Target Role: ${formData.targetRole || "Software Engineer"}
Additional Context: ${formData.additionalInfo}

Create 8-10 roadmap phases. Ensure all arrays contain multiple items. Provide only valid JSON - no markdown formatting. `;

      console.log("Sending request to Gemini API...");

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${
          import.meta.env.VITE_GEMINI_API_KEY
        }`,
=======
You are an expert product strategist. Analyze the startup "${formData.startupName}" at ${formData.website} and provide:
1. A step-by-step roadmap (8-12 phases, each with name, duration, objectives)
2. 5-8 innovative features for competitive advantage
3. Recommended tech stack (frontend, backend, database, etc.)
4. Brief market analysis
5. Realistic development timeline
6. Mermaid flowchart syntax for the phases (graph TB ...)
7. Write a SHORT, professional cold email to the founder, showing interest, mentioning features, and requesting a meeting (max 80 words).
Format the response as JSON with keys: roadmap, extraFeatures, techStack, timeline, marketAnalysis, mermaidChart, coldEmail
`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
>>>>>>> 9f258a72d5f49dbe8313b34cef4e3c08167fc416
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 4096,
            },
          }),
        }
      );

<<<<<<< HEAD
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
=======
      if (!response.ok) throw new Error("Failed to generate content");
      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      
      // Clean the content to remove bad control characters
      const cleanContent = content.replace(/[\x00-\x1F\x7F-\x9F]/g, "");
      
      const jsonMatch =
        cleanContent.match(/```json\n([\s\S]*?)\n```/) ||
        cleanContent.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        try {
          const jsonString = jsonMatch[1] || jsonMatch[0];
          // Additional cleaning for the JSON string
          const cleanJsonString = jsonString
            .replace(/[\x00-\x1F\x7F-\x9F]/g, "")
            .replace(/\\/g, "\\\\")
            .replace(/\n/g, "\\n")
            .replace(/\r/g, "\\r")
            .replace(/\t/g, "\\t");
          
          const parsed = JSON.parse(cleanJsonString);
          setResult(parsed);
          toast.success("Strategy generated!");
        } catch (parseError) {
          console.error("JSON Parse Error:", parseError);
          toast.error("Failed to parse AI response. Please try again.");
        }
      } else {
        throw new Error("Failed to parse AI response");
>>>>>>> 9f258a72d5f49dbe8313b34cef4e3c08167fc416
      }

      const content = data.candidates[0].content.parts[0].text;
      console.log("Generated Content:", content);

      // Try multiple parsing strategies
      let parsedResults = null;

      try {
        // First, try to parse as direct JSON
        parsedResults = JSON.parse(content);
      } catch (e) {
        console.log("Direct JSON parse failed, trying markdown extraction...");

        // Try to extract from markdown code blocks
        const jsonMatch =
          content.match(/```json\s*([\s\S]*?)\s*```/) ||
          content.match(/```\s*([\s\S]*?)\s*```/) ||
          content.match(/\{[\s\S]*\}/);

        if (jsonMatch) {
          try {
            parsedResults = JSON.parse(jsonMatch[1] || jsonMatch[0]);
          } catch (e2) {
            console.error("Markdown JSON parse failed:", e2);
          }
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

      // Render Mermaid chart if available
      if (normalizedResults.mermaidChart) {
        setTimeout(() => {
          try {
            const container = document.getElementById("mermaid-container");
            if (container) {
              mermaid
                .render("mermaid-chart", normalizedResults.mermaidChart)
                .then(({ svg }) => {
                  container.innerHTML = svg;
                })
                .catch((err) => {
                  console.error("Mermaid render error:", err);
                  container.innerHTML =
                    '<p class="text-muted-foreground">Chart rendering failed</p>';
                });
            }
          } catch (mermaidError) {
            console.error("Mermaid error:", mermaidError);
          }
        }, 500);
      }

      toast.success("Strategy generated successfully!");
    } catch (error) {
      console.error("Error generating content:", error);
      toast.error(`Failed to generate strategy: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

<<<<<<< HEAD
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

  const downloadRoadmap = () => {
    const content = `# ${formData.startupName} Competitor Strategy

## Roadmap
${results.roadmap
  .map(
    (phase, index) => `
### ${index + 1}. ${phase.name}
- **Duration**: ${phase.duration}
- **Objectives**: ${phase.objectives}
- **Requirements**: ${phase.requirements}
- **Deliverables**: ${phase.deliverables}
`
  )
  .join("\n")}

## Extra Features
${results.extraFeatures.map((feature) => `- ${feature}`).join("\n")}

## Tech Stack
${results.techStack.map((tech) => `- ${tech}`).join("\n")}

## Cold Email
${results.coldEmail}
`;

    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${formData.startupName}_strategy.md`;
    a.click();
    URL.revokeObjectURL(url);
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
              Build better products, get noticed by founders
            </p>
          </div>
          <Badge variant="outline" className="flex items-center gap-1 text-xs">
            <Sparkles className="w-3 h-3" />
            Gemini 2.0
          </Badge>
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
                        Generating...
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
                        onClick={downloadRoadmap}
                        variant="outline"
                        size="sm"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Export
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
                          <h3 className="font-semibold">Development Roadmap</h3>
                          {results.timeline && (
                            <Badge variant="secondary" className="text-xs">
                              {results.timeline}
                            </Badge>
                          )}
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
                                              <Clock className="w-3 h-3 text-muted-foreground" />
                                              <span className="text-xs text-muted-foreground">
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
                              className="w-full h-64 border rounded p-2 bg-muted/5 text-xs"
                            />
                          </CardContent>
                        </Card>
                      </TabsContent>

                      <TabsContent value="features" className="space-y-3">
                        <div className="grid grid-cols-1 gap-3">
                          <Card>
                            <CardHeader className="pb-3">
                              <CardTitle className="flex items-center gap-2 text-sm">
                                <Lightbulb className="w-4 h-4" />
                                Competitive Features
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
                                Tech Stack
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
                                <div className="mt-3 p-2 bg-background rounded border">
                                  <pre className="whitespace-pre-wrap text-xs">
                                    {results.coldEmail}
                                  </pre>
                                </div>
                              </div>

                              <div className="flex gap-2">
                                <Button
                                  onClick={() =>
                                    window.open(
                                      `mailto:${
                                        formData.founderEmail
                                      }?subject=Regarding ${
                                        formData.startupName
                                      }&body=${encodeURIComponent(
                                        results.coldEmail
                                      )}`
                                    )
                                  }
                                  className="flex-1"
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
=======
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="w-full max-w-3xl p-6">
        <div className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-1">Competitor Strategy Dashboard</h1>
            <p className="text-gray-500 text-sm">Get a quick, actionable strategy for any startup.</p>
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Company Name"
              value={formData.startupName}
              onChange={(e) => handleInputChange("startupName", e.target.value)}
              className="w-40"
            />
            <Input
              placeholder="Website URL"
              value={formData.website}
              onChange={(e) => handleInputChange("website", e.target.value)}
              className="w-52"
            />
            <Button
              onClick={generateWithGemini}
              disabled={isGenerating}
              className="min-w-[140px]"
            >
              {isGenerating ? "Generating..." : "Generate"}
            </Button>
>>>>>>> 9f258a72d5f49dbe8313b34cef4e3c08167fc416
          </div>
        </div>
        {result && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card title="Roadmap">
              <ul className="list-disc pl-5">
                {Array.isArray(result.roadmap)
                  ? result.roadmap.map((phase, i) => (
                      <li key={i}>
                        <strong>{phase.name}</strong> ({phase.duration}): {phase.objectives}
                      </li>
                    ))
                  : <li>No roadmap data.</li>}
              </ul>
            </Card>
            <Card title="Innovative Features">
              <ul className="list-disc pl-5">
                {Array.isArray(result.extraFeatures)
                  ? result.extraFeatures.map((f, i) => <li key={i}>{f}</li>)
                  : <li>No features data.</li>}
              </ul>
            </Card>
            <Card title="Tech Stack">
              <ul className="list-disc pl-5">
                {Array.isArray(result.techStack)
                  ? result.techStack.map((t, i) => <li key={i}>{t}</li>)
                  : <li>No tech stack data.</li>}
              </ul>
            </Card>
            <Card title="Market Analysis">
              <p>{result.marketAnalysis || "No analysis."}</p>
            </Card>
            <Card title="Timeline">
              <p>{result.timeline || "No timeline."}</p>
            </Card>
            <Card title="Cold Email">
              <pre className="bg-gray-50 p-2 rounded text-sm whitespace-pre-wrap">{result.coldEmail || "No email."}</pre>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default ColdEmail;