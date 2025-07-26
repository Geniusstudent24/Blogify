const { Schema, model } = require("mongoose");
const { createHmac, randomBytes } = require("crypto");
const { cratetokenForUser, validation } = require("../services/auhontication");

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      require: true,
    },
    email: {
      type: String,
      require: true,
      unique: true,
    },
    salt: {
      type: Buffer,
    },
    password: {
      type: Buffer,
      require: true,
    },
    photo: {
      type: String,
      default: "images/profile.png",
    },
    role: {
      type: String,
      enum: ["USER", "ADMIN"],
      default: "USER",
    },
  },
  { timestamps: true }
);

userSchema.pre("save", function (next) {
  const user = this;
  if (!user.isModified("password")) return;
  const salt = randomBytes(16);
  const hasedPassword = createHmac("sha256", salt)
    .update(Buffer.from(user.password))
    .digest();
  this.salt = salt;
  this.password = hasedPassword;
  next();
});

userSchema.static("matchPasswordAndToken", async function (email, password) {
  const user = await this.findOne({ email });
  if (!user) throw new Error("user not found");
  const salt = user.salt;
  const hasedPassword = user.password;
  const userProvideHash = createHmac("sha256", salt).update(password).digest();

  if (!hasedPassword.equals(userProvideHash)) {
    throw new Error("incorrect password");
  }
  const token = cratetokenForUser(user);
  return token;
});

const USER = model("user", userSchema);

module.exports = USER;
