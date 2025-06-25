const {Schema, model}  = require("mongoose");

const blogSchem = new Schema({
    title: {
        type: String,
        required: true,
    },
    body: {
        type: String,
        required: true,
    },
    coverImage: {
        type: String,
        required: false
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "user",
    },
}, {timestamps: true});

const blog = model("blog", blogSchem);

module.exports = blog;