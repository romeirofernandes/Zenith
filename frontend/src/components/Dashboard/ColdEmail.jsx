import React, { useState } from "react";
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
  CheckCircle,
  Clock,
  Star,
} from "lucide-react";
import { toast } from "sonner";
import mermaid from "mermaid";

// Initialize Mermaid
mermaid.initialize({
  startOnLoad: true,
  theme: "default",
  securityLevel: "loose",
  themeCSS: `
    .node rect { fill: #f8fafc; stroke: #3b82f6; stroke-width: 2px; }
    .node.clickable { cursor: pointer; }
    .edgePath .path { stroke: #6b7280; stroke-width: 2px; stroke-dasharray: 5,5; }
    .edgeLabel { background-color: #ffffff; }
  `,
});

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
    roadmap: null,
    extraFeatures: [],
    coldEmail: "",
    mermaidChart: "",
    techStack: [],
    timeline: "",
    marketAnalysis: "",
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [expandedSteps, setExpandedSteps] = useState(new Set());

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
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
      }" at ${formData.website} and provide:

1. **DETAILED ROADMAP**: Create a comprehensive step-by-step plan to build a competitive clone with 8-12 main phases. Each phase should have:
   - Phase name
   - Duration estimate
   - Key objectives
   - Technical requirements
   - Deliverables
   - Success metrics

2. **INNOVATIVE FEATURES**: Suggest 5-8 unique features that would give competitive advantage over the original startup

3. **TECH STACK**: Recommend modern tech stack for each component (frontend, backend, database, etc.)

4. **MARKET ANALYSIS**: Brief analysis of market opportunity and positioning

5. **TIMELINE**: Realistic development timeline

6. **MERMAID FLOWCHART**: Generate a Mermaid flowchart syntax that shows the development phases connected with dotted lines. Use this format:
    \`\`\`
   graph TB
   A[Phase 1: Market Research] -.-> B[Phase 2: MVP Design]
   B -.-> C[Phase 3: Core Development]
   C -.-> D[Phase 4: Testing]   
   \`\`\`

7. **COLD EMAIL**: Write a professional cold email to ${
        formData.founderName || "the founder"
      } that:
   - Shows genuine interest in their company
   - Mentions specific features of their product
   - Explains how you've built a competitive analysis/clone
   - Highlights your additional innovative features
   - Requests a meeting/interview opportunity
   - Maintains a respectful, non-threatening tone
   - Shows business acumen and technical skills

Industry: ${formData.industry || "Tech"}
Target Role: ${formData.targetRole || "Software Engineer"}
Additional Context: ${formData.additionalInfo}

Format the response as JSON with keys: roadmap, extraFeatures, techStack, timeline, marketAnalysis, mermaidChart, coldEmail
`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${
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
        throw new Error("Failed to generate content");
      }

      const data = await response.json();
      const content = data.candidates[0].content.parts[0].text;

      // Parse JSON from the response
      const jsonMatch =
        content.match(/```json\n([\s\S]*?)\n```/) ||
        content.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        const parsedResults = JSON.parse(jsonMatch[1] || jsonMatch[0]);
        setResults(parsedResults);

        // Render Mermaid chart
        if (parsedResults.mermaidChart) {
          setTimeout(() => {
            mermaid.render(
              "mermaid-chart",
              parsedResults.mermaidChart,
              (svgCode) => {
                document.getElementById("mermaid-container").innerHTML =
                  svgCode;
              }
            );
          }, 100);
        }

        toast.success("Strategy generated successfully!");
      } else {
        throw new Error("Failed to parse AI response");
      }
    } catch (error) {
      console.error("Error generating content:", error);
      toast.error("Failed to generate strategy. Please try again.");
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

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const downloadRoadmap = () => {
    const content = `
# ${formData.startupName} Competitor Strategy

## Roadmap
${results.roadmap
  ?.map(
    (phase, index) => `
### ${phase.name}
- **Duration**: ${phase.duration}
- **Objectives**: ${phase.objectives}
- **Requirements**: ${phase.requirements}
- **Deliverables**: ${phase.deliverables}
`
  )
  .join("\n")}

## Extra Features
${results.extraFeatures?.map((feature) => `- ${feature}`).join("\n")}

## Tech Stack
${results.techStack?.map((tech) => `- ${tech}`).join("\n")}

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
      <div className="flex-shrink-0 bg-card border-b p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
              <Target className="w-8 h-8" />
              Competitor Strategy Generator
            </h1>
            <p className="text-muted-foreground mt-2">
              Build better products, get noticed by founders, land your dream
              job
            </p>
          </div>
          <Badge variant="outline" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Powered by Gemini 2.5 Pro
          </Badge>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full flex">
          {/* Left Panel - Input Form */}
          <div className="w-1/3 border-r bg-card">
            <ScrollArea className="h-full">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Target Startup Details
                </h2>

                <div className="space-y-4">
                  <div>
                    <Label
                      htmlFor="startupName"
                      className="flex items-center gap-2"
                    >
                      <Building className="w-4 h-4" />
                      Startup Name *
                    </Label>
                    <Input
                      id="startupName"
                      placeholder="e.g., Notion, Figma, Stripe"
                      value={formData.startupName}
                      onChange={(e) =>
                        handleInputChange("startupName", e.target.value)
                      }
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="website"
                      className="flex items-center gap-2"
                    >
                      <Globe className="w-4 h-4" />
                      Website URL *
                    </Label>
                    <Input
                      id="website"
                      placeholder="https://notion.so"
                      value={formData.website}
                      onChange={(e) =>
                        handleInputChange("website", e.target.value)
                      }
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="industry"
                      className="flex items-center gap-2"
                    >
                      <TrendingUp className="w-4 h-4" />
                      Industry
                    </Label>
                    <Input
                      id="industry"
                      placeholder="e.g., SaaS, E-commerce, Fintech"
                      value={formData.industry}
                      onChange={(e) =>
                        handleInputChange("industry", e.target.value)
                      }
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="targetRole"
                      className="flex items-center gap-2"
                    >
                      <Users className="w-4 h-4" />
                      Target Role
                    </Label>
                    <Input
                      id="targetRole"
                      placeholder="e.g., Full Stack Engineer, Product Manager"
                      value={formData.targetRole}
                      onChange={(e) =>
                        handleInputChange("targetRole", e.target.value)
                      }
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="founderName"
                      className="flex items-center gap-2"
                    >
                      <Users className="w-4 h-4" />
                      Founder Name
                    </Label>
                    <Input
                      id="founderName"
                      placeholder="e.g., Ivan Zhao (Notion)"
                      value={formData.founderName}
                      onChange={(e) =>
                        handleInputChange("founderName", e.target.value)
                      }
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="founderEmail"
                      className="flex items-center gap-2"
                    >
                      <Mail className="w-4 h-4" />
                      Founder Email
                    </Label>
                    <Input
                      id="founderEmail"
                      placeholder="founder@startup.com"
                      value={formData.founderEmail}
                      onChange={(e) =>
                        handleInputChange("founderEmail", e.target.value)
                      }
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="additionalInfo"
                      className="flex items-center gap-2"
                    >
                      <Lightbulb className="w-4 h-4" />
                      Additional Context
                    </Label>
                    <Textarea
                      id="additionalInfo"
                      placeholder="Any specific features, tech stack, or business model details you know about..."
                      value={formData.additionalInfo}
                      onChange={(e) =>
                        handleInputChange("additionalInfo", e.target.value)
                      }
                      className="mt-1"
                      rows={3}
                    />
                  </div>

                  <Button
                    onClick={generateWithGemini}
                    disabled={isGenerating}
                    className="w-full mt-6"
                    size="lg"
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                        Generating Strategy...
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
              <div className="p-6">
                {!results.roadmap && !isGenerating && (
                  <div className="flex items-center justify-center h-64 text-muted-foreground">
                    <div className="text-center">
                      <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>
                        Fill in the startup details and generate your strategy
                      </p>
                    </div>
                  </div>
                )}

                {results.roadmap && (
                  <div className="space-y-6">
                    {/* Action Buttons */}
                    <div className="flex justify-between items-center">
                      <h2 className="text-2xl font-bold">
                        {formData.startupName} Competitor Strategy
                      </h2>
                      <div className="flex gap-2">
                        <Button
                          onClick={downloadRoadmap}
                          variant="outline"
                          size="sm"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>

                    <Tabs defaultValue="roadmap" className="w-full">
                      <TabsList className="grid w-full grid-cols-5">
                        <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
                        <TabsTrigger value="flowchart">Flowchart</TabsTrigger>
                        <TabsTrigger value="features">Features</TabsTrigger>
                        <TabsTrigger value="analysis">Analysis</TabsTrigger>
                        <TabsTrigger value="email">Cold Email</TabsTrigger>
                      </TabsList>

                      <TabsContent value="roadmap" className="space-y-4">
                        <div className="flex items-center gap-2 mb-4">
                          <MapPin className="w-5 h-5 text-primary" />
                          <h3 className="text-lg font-semibold">
                            Development Roadmap
                          </h3>
                          <Badge variant="secondary">{results.timeline}</Badge>
                        </div>

                        <div className="space-y-3">
                          {results.roadmap?.map((phase, index) => (
                            <Collapsible key={index}>
                              <CollapsibleTrigger
                                className="w-full"
                                onClick={() => toggleStep(index)}
                              >
                                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                  <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                                          {index + 1}
                                        </div>
                                        <div className="text-left">
                                          <CardTitle className="text-lg">
                                            {phase.name}
                                          </CardTitle>
                                          <div className="flex items-center gap-2 mt-1">
                                            <Clock className="w-4 h-4 text-muted-foreground" />
                                            <span className="text-sm text-muted-foreground">
                                              {phase.duration}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                      {expandedSteps.has(index) ? (
                                        <ChevronDown className="w-5 h-5" />
                                      ) : (
                                        <ChevronRight className="w-5 h-5" />
                                      )}
                                    </div>
                                  </CardHeader>
                                </Card>
                              </CollapsibleTrigger>
                              <CollapsibleContent>
                                <Card className="ml-6 mt-2 border-l-4 border-l-primary">
                                  <CardContent className="pt-4">
                                    <div className="space-y-3">
                                      <div>
                                        <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                                          Objectives
                                        </h4>
                                        <p className="text-sm mt-1">
                                          {phase.objectives}
                                        </p>
                                      </div>
                                      <div>
                                        <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                                          Technical Requirements
                                        </h4>
                                        <p className="text-sm mt-1">
                                          {phase.requirements}
                                        </p>
                                      </div>
                                      <div>
                                        <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                                          Deliverables
                                        </h4>
                                        <p className="text-sm mt-1">
                                          {phase.deliverables}
                                        </p>
                                      </div>
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
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <MapPin className="w-5 h-5" />
                              Interactive Development Flow
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div
                              id="mermaid-container"
                              className="w-full h-96 border rounded-lg p-4 bg-muted/5"
                            />
                          </CardContent>
                        </Card>
                      </TabsContent>

                      <TabsContent value="features" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Card>
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                <Lightbulb className="w-5 h-5" />
                                Competitive Features
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-3">
                                {results.extraFeatures?.map(
                                  (feature, index) => (
                                    <div
                                      key={index}
                                      className="flex items-start gap-3"
                                    >
                                      <Star className="w-4 h-4 text-yellow-500 mt-1 flex-shrink-0" />
                                      <p className="text-sm">{feature}</p>
                                    </div>
                                  )
                                )}
                              </div>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                <Code className="w-5 h-5" />
                                Recommended Tech Stack
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-2">
                                {results.techStack?.map((tech, index) => (
                                  <Badge
                                    key={index}
                                    variant="outline"
                                    className="mr-2 mb-2"
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
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <TrendingUp className="w-5 h-5" />
                              Market Analysis
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="prose prose-sm max-w-none">
                              <p className="whitespace-pre-wrap">
                                {results.marketAnalysis}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>

                      <TabsContent value="email">
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Mail className="w-5 h-5" />
                              Cold Email Template
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              <div className="bg-muted/50 p-4 rounded-lg">
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <p className="text-sm text-muted-foreground">
                                      To:
                                    </p>
                                    <p className="font-medium">
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
                                    <Copy className="w-4 h-4 mr-2" />
                                    Copy
                                  </Button>
                                </div>
                                <div className="mt-4 p-4 bg-background rounded border">
                                  <pre className="whitespace-pre-wrap text-sm font-mono">
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
                                  <Send className="w-4 h-4 mr-2" />
                                  Send Email
                                </Button>
                                <Button
                                  onClick={() =>
                                    copyToClipboard(results.coldEmail)
                                  }
                                  variant="outline"
                                >
                                  <Copy className="w-4 h-4 mr-2" />
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
