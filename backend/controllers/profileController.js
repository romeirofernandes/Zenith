const User = require("../models/User");

// Helper to convert MM/YYYY or YYYY-MM to Date
function parseDateField(val) {
  if (!val) return null;
  if (typeof val === "string") {
    // MM/YYYY
    const mmYYYY = /^(\d{2})\/(\d{4})$/;
    const yyyyMM = /^(\d{4})-(\d{2})$/;
    if (mmYYYY.test(val)) {
      const [, mm, yyyy] = mmYYYY.exec(val);
      return new Date(`${yyyy}-${mm}-01T00:00:00.000Z`);
    }
    if (yyyyMM.test(val)) {
      const [, yyyy, mm] = yyyyMM.exec(val);
      return new Date(`${yyyy}-${mm}-01T00:00:00.000Z`);
    }
    // Try Date parse fallback
    const d = new Date(val);
    return isNaN(d) ? null : d;
  }
  return val;
}

function normalizeResumeDates(resume) {
  if (!resume) return resume;
  if (Array.isArray(resume.experience)) {
    resume.experience = resume.experience.map((exp) => ({
      ...exp,
      startDate: parseDateField(exp.startDate),
      endDate: parseDateField(exp.endDate),
    }));
  }
  if (Array.isArray(resume.certifications)) {
    resume.certifications = resume.certifications.map((cert) => ({
      ...cert,
      date: parseDateField(cert.date),
    }));
  }
  return resume;
}

const profileController = {
  // Get user profile (returns all fields)
  async getProfile(req, res) {
    try {
      const user = await User.findByFirebaseUid(req.user.uid).lean();
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json({ success: true, user });
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ error: "Failed to fetch profile" });
    }
  },

  // Complete/Update profile (handles all resume fields and normalizes dates)
  async completeProfile(req, res) {
    try {
      const { uid } = req.user;
      const profileData = req.body;

      // Find user by Firebase UID
      const user = await User.findByFirebaseUid(uid);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Update user profile with the provided data
      if (profileData.profile) {
        user.profile = { ...user.profile, ...profileData.profile };
      }

      if (profileData.resume) {
        user.resume = {
          ...user.resume,
          ...normalizeResumeDates(profileData.resume),
        };
      }

      // Save the updated user
      await user.save();

      res.json({
        success: true,
        message: "Profile updated successfully",
        user,
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ error: "Failed to update profile" });
    }
  },

  async getProfileAnalytics(req, res) {
    try {
      const user = await User.findByFirebaseUid(req.user.uid).lean();
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Gather analytics data
      const skillsCount = user?.resume?.skills?.length || 0;
      const certificationsCount = user?.resume?.certifications?.length || 0;
      const jobsApplied = user?.jobsApplied?.length || 0;
      const wishlistCount = user?.wishlist?.length || 0;
      const learningPaths = user?.learningPaths?.length || 0;
      const interviewPrep = user?.interviewPrepCount || 0;
      const softskillsCount = user?.resume?.softskills?.length || 0;

      // Pie chart data
      const pieData = [
        { name: "Skills", value: skillsCount },
        { name: "Certifications", value: certificationsCount },
        { name: "Learning Paths", value: learningPaths },
        { name: "Wishlist", value: wishlistCount },
        { name: "Interview Prep", value: interviewPrep },
        { name: "Soft Skills", value: softskillsCount },
      ];

      // Bar chart data
      const barData = [
        {
          name: "You",
          "Jobs Applied": jobsApplied,
          "Wishlist": wishlistCount,
          "Certifications": certificationsCount,
          "Skills": skillsCount,
        },
      ];

      // Timeline data (example: experience, certifications, learning paths)
      const timeline = [];
      if (Array.isArray(user?.resume?.experience)) {
        user.resume.experience.forEach((exp) => {
          if (exp.startDate) {
            timeline.push({
              type: "Experience",
              label: exp.title || exp.company || "Experience",
              date: exp.startDate,
            });
          }
        });
      }
      if (Array.isArray(user?.resume?.certifications)) {
        user.resume.certifications.forEach((cert) => {
          if (cert.date) {
            timeline.push({
              type: "Certification",
              label: cert.name || "Certification",
              date: cert.date,
            });
          }
        });
      }
      if (Array.isArray(user?.learningPaths)) {
        user.learningPaths.forEach((lp) => {
          if (lp.startedAt) {
            timeline.push({
              type: "Learning Path",
              label: lp.name || "Learning Path",
              date: lp.startedAt,
            });
          }
        });
      }

      res.json({
        success: true,
        data: {
          pieData,
          barData,
          timeline,
          stats: {
            skillsCount,
            certificationsCount,
            jobsApplied,
            wishlistCount,
            learningPaths,
            interviewPrep,
            softskillsCount,
          },
        },
      });
    } catch (error) {
      console.error("Error fetching profile analytics:", error);
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  },

  async getResume(req, res) {
    try {
      const user = await User.findByFirebaseUid(req.user.uid).lean();
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      if (!user.resume) {
        return res.status(404).json({ error: "Resume not found" });
      }
      res.json({ resume: user.resume });
    } catch (error) {
      console.error("Error fetching resume:", error);
      res.status(500).json({ error: "Failed to fetch resume" });
    }
  },
};

module.exports = profileController;