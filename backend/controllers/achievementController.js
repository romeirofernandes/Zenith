const Achievement = require("../models/Achievement");
const UserAchievement = require("../models/UserAchievement");
const User = require("../models/User");

// Helper: Check if criteria met
function isUnlocked(criteria, stats) {
  return Object.entries(criteria).every(
    ([key, value]) => (stats[key] || false) === value || (stats[key] || 0) >= value
  );
}

// Example: Get user stats from DB (customize as per your User schema)
async function getUserStats(userId) {
  const user = await User.findOne({ firebaseUid: userId });
  if (!user) return {};

  // Example stats extraction (customize as per your schema)
  return {
    profileCompleted: !!user.profile?.completed,
    resumeUploaded: !!user.resume?.resumeText,
    skillsCount: Array.isArray(user.resume?.skills) ? user.resume.skills.length : 0,
    certificationsCount: Array.isArray(user.resume?.certifications) ? user.resume.certifications.length : 0,
    jobsApplied: Array.isArray(user.jobsApplied) ? user.jobsApplied.length : 0,
    wishlistCount: Array.isArray(user.wishlist) ? user.wishlist.length : 0,
    interviewPrep: user.interviewPrepCount || 0,
    softSkillsAnalyzed: !!user.resume?.softskills && user.resume.softskills.length > 0,
    learningPathsStarted: Array.isArray(user.learningPaths) ? user.learningPaths.length : 0,
    interviews: user.interviewsCount || 0,
    offers: user.offersCount || 0,
    placed: !!user.placed,
  };
}

exports.getAchievements = async (req, res) => {
  try {
    const userId = req.user.uid;
    const stats = await getUserStats(userId);

    const allAchievements = await Achievement.find().lean();
    let userAchievements = await UserAchievement.find({ userId }).lean();

    // Auto-create and unlock
    for (const ach of allAchievements) {
      let ua = userAchievements.find((ua) => ua.achievementCode === ach.code);
      const unlocked = isUnlocked(ach.criteria, stats);
      if (!ua) {
        ua = await UserAchievement.create({
          userId,
          achievementCode: ach.code,
          unlocked,
          unlockedAt: unlocked ? new Date() : null,
        });
        userAchievements.push(ua);
      } else if (unlocked && !ua.unlocked) {
        await UserAchievement.updateOne(
          { _id: ua._id },
          { unlocked: true, unlockedAt: new Date() }
        );
        ua.unlocked = true;
        ua.unlockedAt = new Date();
      }
    }

    const achievements = allAchievements.map((ach) => {
      const ua = userAchievements.find((ua) => ua.achievementCode === ach.code);
      return {
        ...ach,
        unlocked: ua?.unlocked || false,
        unlockedAt: ua?.unlockedAt,
      };
    });

    const summary = {
      unlocked: achievements.filter((a) => a.unlocked).length,
      total: achievements.length,
      percentage: Math.round(
        (achievements.filter((a) => a.unlocked).length / achievements.length) * 100
      ),
    };

    res.json({
      success: true,
      data: {
        achievements,
        stats,
        summary,
      },
    });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
};
