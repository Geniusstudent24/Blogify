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
const flash = require("connect-flash");

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

server.listen(PORT, () => console.log("server is started...", PORT));
