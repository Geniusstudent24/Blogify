require("dotenv").config();
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const http = require("http");
const { Server } = require("socket.io");
const cron = require("node-cron");
const axios = require("axios");

const Blog = require("./model/blog");
const { chekForAuthenticationCookie } = require("./middleware/auoth");
const { deleteS3File } = require("./services/s3-service");
const { router: blogRouterInstance, setIo } = require("./router/blog");
const userRouter = require("./router/user");

const app = express();
const PORT = process.env.PORT || 8000;
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("mongodb connected...."));

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(chekForAuthenticationCookie("token"));
app.use(express.static(path.resolve("./public")));

setIo(io);

// app.js mein routes se upar add karein
app.use((req, res, next) => {
  const isMaintenance = true; // Maintenance on karne ke liye true rakhein

  if (isMaintenance) {
    // Agar user logged in nahi hai ya uska role ADMIN nahi hai
    if (!req.user || req.user.role !== "ADMIN") {
      // Home page ke alawa baki sab routes block kar dega
      if (req.path !== "/user/signin" && req.path !== "/user/signup") {
         return res.send(`
          <div style="text-align:center; padding:50px; font-family:sans-serif;">
            <h1 style="color:#6a00ff;">🚧 Website Under Maintenance 🚧</h1>
            <p>Please try again later</p>
          </div>
        `);
      }
    }
  }
  next();
});
    

app.use("/user", userRouter);
app.use("/blog", blogRouterInstance);

app.get("/", async (req, res) => {
  const allBlg = await Blog.find({}).sort({ createdAt: -1 });
  res.render("home", {
    user: req.user,
    bgls: allBlg,
  });
});

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);
  socket.on("some-event", (data) => {
    io.emit("another-event", data);
  });
  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

cron.schedule("0 0 * * *", async () => {
  console.log("Running scheduled job: Deleting posts older than 14 days...");
  const fourteenDaysAgo = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000);

  try {
    const oldPosts = await Blog.find({ createdAt: { $lte: fourteenDaysAgo } });
    if (oldPosts.length > 0) {
      for (const post of oldPosts) {
        if (post.coverImage) {
          await deleteS3File(post.coverImage);
        }
        await Blog.findByIdAndDelete(post._id);
        console.log(`Post "${post.title}" deleted successfully.`);
      }
    } else {
      console.log("No old posts found to delete.");
    }
  } catch (error) {
    console.error("Error during auto-delete cron job:", error);
  }
});

server.listen(PORT, () => console.log("server is started at PORT:", PORT));
