const { Router } = require("express");
const router = Router();
const multer = require("multer");
const { s3 } = require("../services/s3-service");
const { Upload } = require("@aws-sdk/lib-storage");
const multerS3 = require("multer-s3");
const blogs = require("../model/blog");
const comment = require("../model/comments");
const webPush = require("web-push");
const Subscription = require("../model/subscription");

let ioInstance;

function setIo(io) {
  ioInstance = io;
}

webPush.setVapidDetails(
  "mailto:kingjunagadh737@gmail.com",
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

const s3BucketName = process.env.S3_BUCKET_NAME;

const uploads = multer({
  storage: multerS3({
    s3: s3,
    bucket: s3BucketName,
    acl: "public-read",
    key: function (req, file, cb) {
      cb(null, Date.now().toString() + "-" + file.originalname);
    },
  }),
});

function isAuthenticated(req, res, next) {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });
  if (req.user.role === "ADMIN") {
    next();
  }
}

router.get("/add", isAuthenticated, (req, res) => {
  return res.render("addBlog", {
    user: req.user,
    currentPage: "addBlog",
  });
});

router.get("/:id", async (req, res) => {
  try {
    const blog = await blogs
      .findById(req.params.id)
      .populate("createdBy", "firstName photo");
    const comments = await comment
      .find({ blogId: req.params.id })
      .populate("createdBy", "firstName photo")
      .sort({ createdAt: -1 });

    return res.render("blog", {
      user: req.user,
      bgs: blog,
      comments,
    });
  } catch (error) {
    console.error("Error fetching blog or comments:", error);
    if (error.name === "CastError") {
      return res.status(400).send("Invalid Blog ID.");
    }
    res.status(500).send("Internal Server Error");
  }
});

router.post("/comment/:blogId", isAuthenticated, async (req, res) => {
  try {
    const newComment = await comment.create({
      content: req.body.content,
      blogId: req.params.blogId,
      createdBy: req.user._id,
    });

    const populatedComment = await newComment.populate(
      "createdBy",
      "firstName photo"
    );

    ioInstance.emit("new-comment", {
      blogId: req.params.blogId,
      comment: {
        _id: populatedComment._id,
        content: populatedComment.content,
        createdBy: {
          photo: populatedComment.createdBy.photo,
          firstName: populatedComment.createdBy.firstName,
        },
        createdAt: populatedComment.createdAt,
      },
    });

    res.status(201).end();
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ message: "Failed to add comment." });
  }
});

router.get("/category/:categoryName", async (req, res) => {
  try {
    const categoryName = req.params.categoryName;
    const blogsByCategory = await blogs
      .find({ category: categoryName })
      .populate("createdBy", "firstName photo")
      .sort({ createdAt: -1 });

    res.render("home", {
      user: req.user,
      bgls: blogsByCategory,
      pageCategory: categoryName,
    });
  } catch (error) {
    console.error("Error fetching blogs by category:", error);
    res.redirect("/");
  }
});

router.post(
  "/",
  isAuthenticated,
  uploads.single("coverImage"),
  async (req, res) => {
    try {
      const { title, body, category } = req.body;
      const Blog = await blogs.create({
        body,
        title,
        createdBy: req.user._id,
        coverImage: req.file.location,
        category,
      });

      const payload = JSON.stringify({
        title: `New Blog Post: ${title}`,
        body: `A new post has been added in the ${category} category. Click to view!`,
      });

      const subscriptions = await Subscription.find({});

      for (const sub of subscriptions) {
        try {
          await webPush.sendNotification(sub, payload);
        } catch (error) {
          console.error("Error sending notification to a subscriber: ", error);
        }
      }

      console.log(`Notification sent to ${subscriptions.length} subscribers.`);

      ioInstance.emit("new-blog", {
        title: Blog.title,
        blogId: Blog._id,
      });
      res.json({ success: true, redirect: "/" });
    } catch (error) {
      console.error("Error adding blog:", error);
      res
        .status(500)
        .json({ success: false, message: "Error occurred while adding blog." });
    }
  }
);

router.post("/upload", uploads.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file was uploaded." });
  }
  res.json({ location: req.file.location });
});

module.exports = { router, setIo };
