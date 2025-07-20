import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lightbulb, Loader2, Search, Rocket, Github } from "lucide-react";

const ProjectRecommendations = () => {
  const [jobType, setJobType] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const fetchYouTubeLinks = async (query) => {
    try {
      const res = await fetch(
        `https://corsproxy.io/?https://www.youtube.com/results?search_query=${encodeURIComponent(
          query + " project"
        )}`
      );
      const text = await res.text();
      const videoIds = Array.from(
        text.matchAll(/"videoId":"(.*?)"/g),
        (m) => m[1]
      );
      const uniqueIds = [...new Set(videoIds)].slice(0, 3);
      return uniqueIds.map((id) => `https://www.youtube.com/watch?v=${id}`);
    } catch {
      return [];
    }
  };

  const fetchRecommendations = async () => {
    setLoading(true);
    setSearched(true);
    setRecommendations([]);
    try {
      const githubRes = await fetch(
        `https://api.github.com/search/repositories?q=${encodeURIComponent(
          jobType + " project"
        )}&sort=stars&order=desc&per_page=3`
      );
      const githubData = await githubRes.json();
      const youtubeLinks = await fetchYouTubeLinks(jobType);

      const projects = [];
      for (let i = 0; i < 3; i++) {
        const gh = githubData.items?.[i];
        const yt = youtubeLinks[i];
        if (gh || yt) {
          projects.push({
            title: gh?.name || "Project",
            description: gh?.description || "",
            technologies: gh?.language ? [gh.language] : [],
            difficulty: "",
            github: gh?.html_url || "",
            youtube: yt || "",
          });
        }
      }
      setRecommendations(projects);
    } catch (err) {
      console.error("Error fetching project recommendations:", err);
      setRecommendations([]);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6 text-primary text-center">
        Project Recommendations for Your Dream Job
      </h1>
      <Card className="mb-8 shadow">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Search className="w-5 h-5" />
            Enter Job Type / Role
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (jobType.trim()) fetchRecommendations();
            }}
            className="flex flex-col sm:flex-row gap-2"
          >
            <input
              className="border rounded px-3 py-2 flex-1"
              placeholder="e.g. Frontend Developer, Data Scientist, SDE at Google"
              value={jobType}
              onChange={(e) => setJobType(e.target.value)}
              required
            />
            <Button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 transition-colors hover:bg-blue-700"
            >
              {loading ? (
                <Loader2 className="animate-spin w-5 h-5" />
              ) : (
                <>
                  <Rocket className="w-4 h-4" />
                  Get Projects
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {searched && !loading && recommendations.length === 0 && (
        <div className="text-center text-gray-500 py-10">
          <Lightbulb className="mx-auto mb-4 w-10 h-10 text-yellow-400" />
          <div>No recommendations found. Try a different job type!</div>
        </div>
      )}

      {recommendations.length > 0 && (
        <div className="flex flex-col gap-8">
          {recommendations.map((proj, idx) => (
            <Card
              key={proj.title + idx}
              className="shadow-lg w-full overflow-hidden"
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Lightbulb className="w-6 h-6 text-primary" />
                  <CardTitle className="text-xl">{proj.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col lg:flex-row gap-6 items-start">
                  <div className="flex-1 min-w-[220px]">
                    <div className="mb-2 text-gray-700">{proj.description}</div>
                    <div className="mb-3 flex flex-wrap gap-2">
                      {proj.technologies?.map((tech, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                    {proj.difficulty && (
                      <div className="mb-2 text-xs text-gray-500">
                        Difficulty: {proj.difficulty}
                      </div>
                    )}
                    <div className="flex flex-wrap gap-3 items-center mt-2">
                      {proj.github && (
                        <Button
                          asChild
                          variant="outline"
                          className="flex items-center gap-2 text-xs px-3 py-1 hover:bg-blue-50 hover:text-blue-700 transition"
                        >
                          <a
                            href={proj.github}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Github className="w-4 h-4 mr-1" />
                            GitHub
                          </a>
                        </Button>
                      )}
                      {proj.youtube && (
                        <a
                          href={proj.youtube}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-red-600 underline text-xs"
                        >
                          YouTube
                        </a>
                      )}
                    </div>
                  </div>
                  {proj.github && (
                    <div className="flex-1 min-w-[320px] max-w-xl">
                      <iframe
                        title="Gitdiagram"
                        src={proj.github.replace(
                          "github.com",
                          "gitdiagram.com"
                        )}
                        width="100%"
                        height="300"
                        className="border border-gray-300 rounded-lg"
                        allowFullScreen
                      ></iframe>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectRecommendations;
