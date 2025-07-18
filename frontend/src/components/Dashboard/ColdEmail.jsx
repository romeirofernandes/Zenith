import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  const [result, setResult] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
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
      }
    } catch (error) {
      console.error("Error generating content:", error);
      toast.error("Failed to generate strategy. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

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