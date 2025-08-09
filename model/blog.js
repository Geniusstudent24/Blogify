const { Schema, model } = require("mongoose");

const blogSchem = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ["General", "Assignment", "Notice", "Study Material"],
      default: "General",
    },
    coverImage: {
      type: String,
      required: false,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
  },
  { timestamps: true }
);

const blog = model("blog", blogSchem);

module.exports = blog;
