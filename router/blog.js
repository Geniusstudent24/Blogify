const { Router } = require("express");
const router = Router();
const multer = require("multer");
const path = require("path");
const blogs = require("../model/blog");
const comment = require("../model/comments");

let ioInstance;

function setIo(io) {
  ioInstance = io;
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.resolve("./public/upload/")),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const uploads = multer({ storage });

function isAuthenticated(req, res, next) {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });
  next();
}

router.get("/add", isAuthenticated, (req, res) => {
  return res.render("addBlog", {
    user: req.user,
    currentPage: "addBlog",
  });
});

router.get("/:id", async (req, res) => {
  try {
    const blog = await blogs.findById(req.params.id).populate("createdBy", "firstName photo");
    const comments = await comment.find({ blogId: req.params.id })
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

    const populatedComment = await newComment.populate("createdBy", "firstName photo");

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

router.post("/", isAuthenticated, uploads.single("coverImage"), async (req, res) => {
  try {
    const { title, body } = req.body;
    const Blog = await blogs.create({
      body,
      title,
      createdBy: req.user._id,
      coverImage: `/upload/${req.file.filename}`,
    });
    
    ioInstance.emit("new-blog", {
    title: Blog.title,
    blogId: Blog._id,
});
    res.json({ success: true, redirect: '/' });
  } catch (error) {
    console.error("Error adding blog:", error);
    res.status(500).json({ success: false, message: "Error occurred while adding blog." });
  }
});

module.exports = { router, setIo };