const { Router } = require("express");
const router = Router();
const multer = require("multer");
const { s3 } = require("../services/s3-service");
const { Upload } = require("@aws-sdk/lib-storage");
const multerS3 = require("multer-s3");
const blogs = require("../model/blog");
const comment = require("../model/comments");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { GetObjectCommand } = require("@aws-sdk/client-s3");

let ioInstance;

function setIo(io) {
  ioInstance = io;
}

const s3BucketName = process.env.S3_BUCKET_NAME;

const uploads = multer({
  storage: multerS3({
    s3: s3,
    bucket: s3BucketName,
    acl: "private",
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      cb(null, Date.now().toString() + "-" + file.originalname);
    },
  }),
});

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
    const blog = await blogs
      .findById(req.params.id)
      .populate("createdBy", "firstName photo");
    
    if (req.query.view === "pdf") {
      if (!blog) return res.status(404).send("Blog not found");

      const isPDF = blog.coverImage.toLowerCase().endsWith(".pdf");

      if (isPDF) {
        const key = blog.coverImage.split('/').pop();
        const command = new GetObjectCommand({
          Bucket: s3BucketName,
          Key: key,
        });
        const securePdfUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
        return res.render("pdfViewer", {
          user: req.user,
          securePdfUrl,
        });
      } else {
        return res.redirect(blog.coverImage);
      }
    }

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
    console.error("Error:", error);
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

      ioInstance.emit("new-blog", {
        title: Blog.title,
        blogId: Blog._id,
      });
      res.json({ success: true, redirect: "/" });
    } catch (error) {
      res.status(500).json({ success: false, message: "Error" });
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
