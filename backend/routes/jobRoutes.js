// routes/jobRoutes.js
const express = require("express");
const router = express.Router();
const {
  postJob,
  getAllJobs,
  getJobById,
  addToWishlist,
  removeFromWishlist,
  getUserWishlist,
} = require("../controllers/jobController");

router.post("/postjd", postJob);
router.get("/all", getAllJobs);
router.get("/:id", getJobById);
router.post("/wishlist/:jobId", addToWishlist);
router.delete("/wishlist/:jobId", removeFromWishlist);
router.get("/wishlist/user/:firebaseUid", getUserWishlist);

module.exports = router;
