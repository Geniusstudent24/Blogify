require("dotenv").config();
const express = require("express");
const path = require("path");
const userRouter = require("./router/user");
const blogRouter = require("./router/blog");
const mongoose = require("mongoose");
const { chekForAuthenticationCookie } = require("./middleware/auoth");
const cookieParser = require("cookie-parser");
const Blog = require("./model/blog");
const http = require("http");
const { Server } = require("socket.io");
const session = require("express-session");
const cron = require("node-cron");
const { deleteS3File } = require("./services/s3-service");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 8000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const { router: blogRouterInstance, setIo } = require("./router/blog");

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("mongodb connected...."));

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.json());
app.use(chekForAuthenticationCookie("token"));
app.use(express.static(path.resolve("./public")));

setIo(io);

app.use("/user", userRouter);
app.use("/blog", blogRouterInstance);
app.get("/", async (req, res) => {
  const allBlg = await Blog.find({});
  res.render("home", {
    user: req.user,
    bgls: allBlg,
  });
});

io.on("connection", (socket) => {
  console.log(socket.id);
  socket.on("some-event", (data) => {
    console.log(data);
    io.emit("another-event", data);
  });
  socket.on("disconnect", () => {
    console.log(socket.id);
  });
});

cron.schedule("* * * * *", async () => {
  console.log("Running keep-alive job: Sending request to self to prevent sleep...");
  try {
    await axios.get(process.env.DEPLOYED_URL);
    console.log(`Keep-alive successful to ${process.env.DEPLOYED_URL}`);
  } catch (error) {
    console.error("Keep-alive job failed (Server might be down or URL is wrong):", error.message);
  }
});

cron.schedule("0 0 * * *", async () => {
  console.log("Running scheduled job: Deleting posts older than 14 days...");
  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

  try {
    const oldPosts = await Blog.find({ createdAt: { $lte: fourteenDaysAgo } });

    if (oldPosts.length > 0) {
      for (const post of oldPosts) {
        if (post.coverImage) {
          await deleteS3File(post.coverImage);
        }
        await Blog.findByIdAndDelete(post._id);
        console.log(`Post "${post.title}" deleted from MongoDB.`);
      }
    } else {
      console.log("No old posts to delete.");
    }
  } catch (error) {
    console.error("Error during the auto-delete cron job:", error);
  }
});


app.use(cookieParser());
app.use(express.json());
app.use(chekForAuthenticationCookie("token"));
app.use(express.static(path.resolve("./public")));

setIo(io);

app.use("/user", userRouter);
app.use("/blog", blogRouterInstance);
app.get("/", async (req, res) => {
  const allBlg = await Blog.find({});
  res.render("home", {
    user: req.user,
    bgls: allBlg,
  });
});

io.on("connection", (socket) => {
  console.log(socket.id);
  socket.on("some-event", (data) => {
    console.log(data);
    io.emit("another-event", data);
  });
  socket.on("disconnect", () => {
    console.log(socket.id);
  });
});

cron.schedule("0 0 * * *", async () => {
  console.log("Running scheduled job: Deleting posts older than 14 days...");
  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

  try {
    const oldPosts = await Blog.find({ createdAt: { $lte: fourteenDaysAgo } });

    if (oldPosts.length > 0) {
      for (const post of oldPosts) {
        if (post.coverImage) {
          await deleteS3File(post.coverImage);
        }
        await Blog.findByIdAndDelete(post._id);
        console.log(`Post "${post.title}" deleted from MongoDB.`);
      }
    } else {
      console.log("No old posts to delete.");
    }
  } catch (error) {
    console.error("Error during the auto-delete cron job:", error);
  }
});

server.listen(PORT, () => console.log("server is started...", PORT));
