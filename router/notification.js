const { Router } = require("express");
const router = Router();
const Subscription = require("../model/subscription");

router.get("/vapidPublicKey", (req, res) => {
  res.send(process.env.VAPID_PUBLIC_KEY);
});

router.post("/subscribe", async (req, res) => {
  const subscription = req.body;

  try {
    await Subscription.create(subscription);
    res.status(201).json({ message: "Subscribed saved successfully" });
  } catch (error) {
    console.error("Error saving subscription:", error);
    res.status(500).json({ message: "Failed to save subscription" });
  }
});

module.exports = router;
