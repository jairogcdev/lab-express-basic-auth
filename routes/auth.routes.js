const express = require("express");
const router = express.Router();
const User = require("../models/User.model");
const bcrypt = require("bcryptjs");

// GET /auth/signup
router.get("/signup", (req, res, next) => {
  res.render("auth/signup");
});
// POST /auth/signup
router.post("/signup", async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      res.status(400).render("auth/signup", {
        errorMessage: "Todos los campos deben estar llenos",
      });
      return;
    }
    const passwordRegex =
      /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm;

    if (passwordRegex.test(password) === false) {
      res.status(400).render("auth/signup", {
        errorMessage:
          "La contraseña no es suficientemente segura. Debe tener 8 caracteres al menos una mayúscula, una minúscula y un número.",
      });
      return;
    }
    const foundUser = await User.findOne({ username });
    if (foundUser !== null) {
      res.render("auth/signup", {
        errorMessage: "Username ya registrado",
      });
      return;
    }
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);
    await User.create({ username, password: hashedPassword });
    console.log("Usuario " + username + " creado correctamente");
    res.redirect("/");
  } catch (error) {
    next(error);
  }
});

// GET /auth/login
router.get("/login", (req, res, next) => {
  res.render("auth/login");
});

// POST /auth/login
router.post("/login", async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      res.status(400).render("auth/login", {
        errorMessage: "Todos los campos deben estar llenos",
      });
      return;
    }

    const foundUser = await User.findOne({ username });
    if (foundUser === null) {
      res.status(404).render("auth/login", {
        errorMessage: "Usuario no registrado",
        username,
        password,
      });
      return;
    }
    const isValidPassword = await bcrypt.compare(password, foundUser.password);
    if (isValidPassword === false) {
      res.status(404).render("auth/login", {
        errorMessage: "La contraseña no es válida",
        username,
      });
      return;
    }

    const sessionInfo = {
      _id: foundUser.id,
      username: foundUser.username,
    };

    req.session.user = sessionInfo;
    req.session.save(() => {
      res.redirect("/profile");
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
