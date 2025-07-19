import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Upload,
  FileText,
  Plus,
  X,
  Save,
  User,
  Award,
  Briefcase,
} from "lucide-react";
import { toast } from "sonner";

// Helper function to convert ISO date to yyyy-MM-dd format
const formatDateForInput = (isoString) => {
  if (!isoString) return "";
  try {
    const date = new Date(isoString);
    return date.toISOString().split("T")[0];
  } catch (error) {
    return "";
  }
};

const Profile = ({
  user,
  userProfile,
  loading,
  handleLogout,
  refreshProfile,
}) => {
  const [profileData, setProfileData] = useState({
    profile: {
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      gender: "",
      address: {
        street: "",
        city: "",
        state: "",
        country: "",
        zipCode: "",
      },
    },
    resume: {
      softskills: [],
      resumeText: "",
      skills: [],
      experience: [],
      education: [],
      coCurricular: [],
      certifications: [],
      projects: [],
      summary: "",
      linkedin: "",
      profileLinks: [],
    },
  });

  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setProfileData({
        profile: {
          firstName: userProfile.profile?.firstName || "",
          lastName: userProfile.profile?.lastName || "",
          dateOfBirth:
            formatDateForInput(userProfile.profile?.dateOfBirth) || "",
          gender: userProfile.profile?.gender || "",
          address: {
            street: userProfile.profile?.address?.street || "",
            city: userProfile.profile?.address?.city || "",
            state: userProfile.profile?.address?.state || "",
            country: userProfile.profile?.address?.country || "",
            zipCode: userProfile.profile?.address?.zipCode || "",
          },
        },
        resume: {
          softskills: userProfile.resume?.softskills || [],
          resumeText: userProfile.resume?.resumeText || "",
          skills: userProfile.resume?.skills || [],
          experience: (userProfile.resume?.experience || []).map((exp) => ({
            ...exp,
            startDate: formatDateForInput(exp.startDate),
            endDate: formatDateForInput(exp.endDate),
          })),
          education: userProfile.resume?.education || [],
          coCurricular: userProfile.resume?.coCurricular || [],
          certifications: userProfile.resume?.certifications || [],
          projects: userProfile.resume?.projects || [],
          summary: userProfile.resume?.summary || "",
          linkedin: userProfile.resume?.linkedin || "",
          profileLinks: userProfile.resume?.profileLinks || [],
        },
      });
    }
  }, [userProfile]);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:8000/extract_resume", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to extract resume");
      }

      const data = await response.json();
      console.log("Extracted resume data:", data);
      const extractedResume = data.parsed_resume;
      console.log("Extracted Resume:", extractedResume);

      // Update profile data with extracted information
      setProfileData((prev) => ({
        ...prev,
        resume: {
          ...prev.resume,
          ...extractedResume,
          // Format dates if they exist in extracted data
          experience: (
            extractedResume.experience ||
            prev.resume.experience ||
            []
          ).map((exp) => ({
            ...exp,
            startDate: formatDateForInput(exp.startDate),
            endDate: formatDateForInput(exp.endDate),
          })),
        },
      }));

      toast.success(
        "Resume extracted successfully! Please review and edit the extracted information."
      );
    } catch (error) {
      toast.error("Failed to extract resume. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const token = await user.getIdToken();
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/profile/profile-completion`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(profileData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save profile");
      }

      toast.success(
        "Profile saved successfully! Your profile has been updated."
      );

      if (refreshProfile) {
        refreshProfile();
      }
    } catch (error) {
      toast.error("Failed to save profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const addArrayItem = (section, item) => {
    setProfileData((prev) => ({
      ...prev,
      resume: {
        ...prev.resume,
        [section]: [...prev.resume[section], item],
      },
    }));
  };

  const removeArrayItem = (section, index) => {
    setProfileData((prev) => ({
      ...prev,
      resume: {
        ...prev.resume,
        [section]: prev.resume[section].filter((_, i) => i !== index),
      },
    }));
  };

  const updateArrayItem = (section, index, field, value) => {
    setProfileData((prev) => ({
      ...prev,
      resume: {
        ...prev.resume,
        [section]: prev.resume[section].map((item, i) =>
          i === index ? { ...item, [field]: value } : item
        ),
      },
    }));
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground text-xl">Loading user...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Profile Management</h1>
        <div className="flex gap-2">
          <Button onClick={handleSaveProfile} disabled={isSaving}>
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Saving..." : "Save Profile"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="resume">Resume</TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={profileData.profile.firstName}
                    onChange={(e) =>
                      setProfileData((prev) => ({
                        ...prev,
                        profile: { ...prev.profile, firstName: e.target.value },
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={profileData.profile.lastName}
                    onChange={(e) =>
                      setProfileData((prev) => ({
                        ...prev,
                        profile: { ...prev.profile, lastName: e.target.value },
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={profileData.profile.dateOfBirth}
                    onChange={(e) =>
                      setProfileData((prev) => ({
                        ...prev,
                        profile: {
                          ...prev.profile,
                          dateOfBirth: e.target.value,
                        },
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <Input
                    id="gender"
                    value={profileData.profile.gender}
                    onChange={(e) =>
                      setProfileData((prev) => ({
                        ...prev,
                        profile: { ...prev.profile, gender: e.target.value },
                      }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="street">Street</Label>
                    <Input
                      id="street"
                      value={profileData.profile.address.street}
                      onChange={(e) =>
                        setProfileData((prev) => ({
                          ...prev,
                          profile: {
                            ...prev.profile,
                            address: {
                              ...prev.profile.address,
                              street: e.target.value,
                            },
                          },
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={profileData.profile.address.city}
                      onChange={(e) =>
                        setProfileData((prev) => ({
                          ...prev,
                          profile: {
                            ...prev.profile,
                            address: {
                              ...prev.profile.address,
                              city: e.target.value,
                            },
                          },
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={profileData.profile.address.state}
                      onChange={(e) =>
                        setProfileData((prev) => ({
                          ...prev,
                          profile: {
                            ...prev.profile,
                            address: {
                              ...prev.profile.address,
                              state: e.target.value,
                            },
                          },
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={profileData.profile.address.country}
                      onChange={(e) =>
                        setProfileData((prev) => ({
                          ...prev,
                          profile: {
                            ...prev.profile,
                            address: {
                              ...prev.profile.address,
                              country: e.target.value,
                            },
                          },
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="zipCode">Zip Code</Label>
                    <Input
                      id="zipCode"
                      value={profileData.profile.address.zipCode}
                      onChange={(e) =>
                        setProfileData((prev) => ({
                          ...prev,
                          profile: {
                            ...prev.profile,
                            address: {
                              ...prev.profile.address,
                              zipCode: e.target.value,
                            },
                          },
                        }))
                      }
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resume">
          <div className="space-y-6">
            {/* Resume Upload Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Resume Upload
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="resume-upload"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-4 text-gray-500" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span>{" "}
                        your resume
                      </p>
                      <p className="text-xs text-gray-500">PDF files only</p>
                    </div>
                    <input
                      id="resume-upload"
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={handleFileUpload}
                      disabled={isUploading}
                    />
                  </label>
                </div>
                {isUploading && (
                  <div className="mt-4 text-center text-sm text-gray-500">
                    Extracting resume information...
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Resume Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Professional Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Enter your professional summary"
                  value={profileData.resume.summary}
                  onChange={(e) =>
                    setProfileData((prev) => ({
                      ...prev,
                      resume: { ...prev.resume, summary: e.target.value },
                    }))
                  }
                  rows={4}
                />
              </CardContent>
            </Card>

            {/* Skills */}
            <Card>
              <CardHeader>
                <CardTitle>Skills</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Technical Skills</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {profileData.resume.skills.map((skill, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {skill}
                        <X
                          className="w-3 h-3 cursor-pointer"
                          onClick={() => removeArrayItem("skills", index)}
                        />
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Input
                      placeholder="Add a skill"
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && e.target.value.trim()) {
                          addArrayItem("skills", e.target.value.trim());
                          e.target.value = "";
                        }
                      }}
                    />
                  </div>
                </div>

                <div>
                  <Label>Soft Skills</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {profileData.resume.softskills.map((skill, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="flex items-center gap-1"
                      >
                        {skill}
                        <X
                          className="w-3 h-3 cursor-pointer"
                          onClick={() => removeArrayItem("softskills", index)}
                        />
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Input
                      placeholder="Add a soft skill"
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && e.target.value.trim()) {
                          addArrayItem("softskills", e.target.value.trim());
                          e.target.value = "";
                        }
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Experience */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5" />
                    Experience
                  </span>
                  <Button
                    size="sm"
                    onClick={() =>
                      addArrayItem("experience", {
                        company: "",
                        position: "",
                        startDate: "",
                        endDate: "",
                        description: "",
                      })
                    }
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Experience
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {profileData.resume.experience.map((exp, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1">
                        <Input
                          placeholder="Company"
                          value={exp.company || ""}
                          onChange={(e) =>
                            updateArrayItem(
                              "experience",
                              index,
                              "company",
                              e.target.value
                            )
                          }
                        />
                        <Input
                          placeholder="Position"
                          value={exp.position || ""}
                          onChange={(e) =>
                            updateArrayItem(
                              "experience",
                              index,
                              "position",
                              e.target.value
                            )
                          }
                        />
                        <Input
                          type="date"
                          placeholder="Start Date"
                          value={exp.startDate || ""}
                          onChange={(e) =>
                            updateArrayItem(
                              "experience",
                              index,
                              "startDate",
                              e.target.value
                            )
                          }
                        />
                        <Input
                          type="date"
                          placeholder="End Date"
                          value={exp.endDate || ""}
                          onChange={(e) =>
                            updateArrayItem(
                              "experience",
                              index,
                              "endDate",
                              e.target.value
                            )
                          }
                        />
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => removeArrayItem("experience", index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <Textarea
                      placeholder="Description"
                      value={exp.description || ""}
                      onChange={(e) =>
                        updateArrayItem(
                          "experience",
                          index,
                          "description",
                          e.target.value
                        )
                      }
                      rows={3}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Education */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Education
                  </span>
                  <Button
                    size="sm"
                    onClick={() =>
                      addArrayItem("education", {
                        institution: "",
                        degree: "",
                        fieldOfStudy: "",
                        startYear: "",
                        endYear: "",
                        grade: "",
                      })
                    }
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Education
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {profileData.resume.education.map((edu, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1">
                        <Input
                          placeholder="Institution"
                          value={edu.institution || ""}
                          onChange={(e) =>
                            updateArrayItem(
                              "education",
                              index,
                              "institution",
                              e.target.value
                            )
                          }
                        />
                        <Input
                          placeholder="Degree"
                          value={edu.degree || ""}
                          onChange={(e) =>
                            updateArrayItem(
                              "education",
                              index,
                              "degree",
                              e.target.value
                            )
                          }
                        />
                        <Input
                          placeholder="Field of Study"
                          value={edu.fieldOfStudy || ""}
                          onChange={(e) =>
                            updateArrayItem(
                              "education",
                              index,
                              "fieldOfStudy",
                              e.target.value
                            )
                          }
                        />
                        <Input
                          placeholder="Grade"
                          value={edu.grade || ""}
                          onChange={(e) =>
                            updateArrayItem(
                              "education",
                              index,
                              "grade",
                              e.target.value
                            )
                          }
                        />
                        <Input
                          type="number"
                          placeholder="Start Year"
                          value={edu.startYear || ""}
                          onChange={(e) =>
                            updateArrayItem(
                              "education",
                              index,
                              "startYear",
                              e.target.value
                            )
                          }
                        />
                        <Input
                          type="number"
                          placeholder="End Year"
                          value={edu.endYear || ""}
                          onChange={(e) =>
                            updateArrayItem(
                              "education",
                              index,
                              "endYear",
                              e.target.value
                            )
                          }
                        />
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => removeArrayItem("education", index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* LinkedIn */}
            <Card>
              <CardHeader>
                <CardTitle>Professional Links</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="linkedin">LinkedIn URL</Label>
                  <Input
                    id="linkedin"
                    placeholder="https://linkedin.com/in/yourprofile"
                    value={profileData.resume.linkedin}
                    onChange={(e) =>
                      setProfileData((prev) => ({
                        ...prev,
                        resume: { ...prev.resume, linkedin: e.target.value },
                      }))
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;
