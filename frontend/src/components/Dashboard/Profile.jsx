import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

  const [isSaving, setIsSaving] = useState(false);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const token = await user.getIdToken();
      const response = await fetch(
        "http://localhost:5000/api/profile/profile-completion",
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

      toast({
        title: "Profile saved successfully",
        description: "Your profile has been updated",
      });

      refreshProfile();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Profile Management</h1>
        <div className="flex gap-2">
          <Button onClick={handleSaveProfile} disabled={isSaving}>
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Saving..." : "Save Profile"}
          </Button>
          <Button onClick={handleLogout} variant="outline">
            Logout
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
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

        <Card>
          <CardHeader>
            <CardTitle>Resume Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="softskills">Soft Skills</Label>
                <Input
                  id="softskills"
                  value={profileData.resume.softskills.join(", ")}
                  onChange={(e) =>
                    setProfileData((prev) => ({
                      ...prev,
                      resume: {
                        ...prev.resume,
                        softskills: e.target.value
                          .split(",")
                          .map((skill) => skill.trim()),
                      },
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="resumeText">Resume Text</Label>
                <Input
                  id="resumeText"
                  value={profileData.resume.resumeText}
                  onChange={(e) =>
                    setProfileData((prev) => ({
                      ...prev,
                      resume: { ...prev.resume, resumeText: e.target.value },
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="skills">Skills</Label>
                <Input
                  id="skills"
                  value={profileData.resume.skills.join(", ")}
                  onChange={(e) =>
                    setProfileData((prev) => ({
                      ...prev,
                      resume: {
                        ...prev.resume,
                        skills: e.target.value
                          .split(",")
                          .map((skill) => skill.trim()),
                      },
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="summary">Summary</Label>
                <Input
                  id="summary"
                  value={profileData.resume.summary}
                  onChange={(e) =>
                    setProfileData((prev) => ({
                      ...prev,
                      resume: { ...prev.resume, summary: e.target.value },
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input
                  id="linkedin"
                  value={profileData.resume.linkedin}
                  onChange={(e) =>
                    setProfileData((prev) => ({
                      ...prev,
                      resume: { ...prev.resume, linkedin: e.target.value },
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="profileLinks">Profile Links</Label>
                <Input
                  id="profileLinks"
                  value={profileData.resume.profileLinks
                    .map((link) => `${link.platform}: ${link.url}`)
                    .join(", ")}
                  onChange={(e) =>
                    setProfileData((prev) => ({
                      ...prev,
                      resume: {
                        ...prev.resume,
                        profileLinks: e.target.value.split(",").map((link) => {
                          const [platform, url] = link
                            .split(":")
                            .map((item) => item.trim());
                          return { platform, url };
                        }),
                      },
                    }))
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
