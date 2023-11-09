const express = require("express");
const router = express.Router();
const User = require("../models/User.model");
const isLoggedIn = require("../middlewares/auth.middleware");

router.get("/", isLoggedIn, async (req, res, next) => {
  try {
    const userId = req.session.user._id;
    const oneUser = await User.findById(userId).select({
      username: 1,
    });
    res.render("profile/main");
  } catch (error) {
    next(error);
  }
});

router.get("/private", isLoggedIn, (req, res, next) => {
  res.render("profile/private");
});

module.exports = router;
