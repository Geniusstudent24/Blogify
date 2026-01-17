const { Router } = require("express");
const USER = require("../model/user");
const router = Router();
const Blog = require("../model/blog");
const fetch = require("node-fetch");
const Settings = require("../model/settings");

router.get("/signin", (req, res) => {
  return res.render("signin");
});

router.get("/profile", (req, res) => {
  return res.render("profile", {
    user: req.user,
  });
});

router.get("/signup", (req, res) => {
  return res.render("signup");
});

router.post("/signup", async (req, res) => {
  const { firstName, email, password } = req.body;
  const recaptchaResponse = req.body["g-recaptcha-response"];
  if (!recaptchaResponse) {
    return res
      .status(400)
      .render("signup", { error: "Please complete the CAPTCHA." });
  }

  try {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptchaResponse}`;

    const response = await fetch(verificationUrl, { method: "POST" });
    const data = await response.json();
    if (!data.success) {
      console.error("CAPTCHA verification failed:", data);
      return res.status(400).render("signup", {
        error: "CAPTCHA verification failed. Please try again.",
      });
    }
    await USER.create({
      firstName,
      email,
      password,
    });
    const token = await USER.matchPasswordAndToken(email, password);
    return res.cookie("token", token).redirect("/");
  } catch (error) {
    console.error(
      "Error in CAPTCHA verification process (catch block):",
      error
    );
    return res.render("signup", {
      error:
        "An error occurred during CAPTCHA verification or login. Please try again.",
    });
  }
});

router.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  const recaptchaResponse = req.body["g-recaptcha-response"];
  if (!recaptchaResponse) {
    return res
      .status(400)
      .render("signin", { error: "Please complete the CAPTCHA." });
  }
  try {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptchaResponse}`;

    const response = await fetch(verificationUrl, { method: "POST" });
    const data = await response.json();
    if (!data.success) {
      console.error("CAPTCHA verification failed:", data);
      return res.status(400).render("signin", {
        error: "CAPTCHA verification failed. Please try again.",
      });
    }
    const token = await USER.matchPasswordAndToken(email, password);
    return res.cookie("token", token).redirect("/");
  } catch (error) {
    console.error(
      "Error in CAPTCHA verification process (catch block):",
      error
    );
    return res.render("signin", {
      error:
        "An error occurred during CAPTCHA verification or login. Please try again.",
    });
  }
});

router.get("/logout", (req, res) => {
  return res.clearCookie("tokens").render("signin");
});

router.get("/home", async (req, res) => {
  try {
    const allBlg = await Blog.find({});
    return res.render("home", {
      user: req.user,
      bgls: allBlg,
    });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    res.status(500).send("Error occurred while fetching blogs.");
  }
});

router.post("/toggle-maintenance", async (req, res) => {
    try {
        if (!req.user || req.user.role !== "ADMIN") {
            return res.status(403).json({ success: false, message: "Admin access required" });
        }

        let settings = await Settings.findOne();
        if (!settings) {
            settings = await Settings.create({ isMaintenance: false });
        }

        settings.isMaintenance = !settings.isMaintenance;
        await settings.save();

        res.json({ 
            success: true, 
            isMaintenance: settings.isMaintenance,
            message: `Maintenance mode is now ${settings.isMaintenance ? 'enabled' : 'disabled'}`
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});
module.exports = router;
