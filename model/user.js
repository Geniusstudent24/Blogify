const {Schema, model}  = require("mongoose");
const {createHmac, randomBytes} = require("crypto");
const {cratetokenForUser, validation} = require("../services/auhontication");

const userSchema = new Schema({
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
            type: String,
        },
        password: {
            type: String,
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
    }, {timestamps: true});


userSchema.pre("save", function (next) {
        const user = this;
        if(!user.isModified("password")) return;
        const salt = randomBytes(16).toString();
        const hasedPassword = createHmac("sha256", salt).update(user.password).digest("hex");

        this.salt = salt;
        this.password = hasedPassword;
        next();
});

userSchema.static("matchPasswordAndToken", async function(email, password) {
        const user = await this.findOne({ email });
        if(!user) throw new Error('user not found');
        const salt = user.salt;
        const hasedPassword = user.password;
        const userProvideHash = createHmac("sha256", salt).update(password).digest("hex");
        if(hasedPassword !== userProvideHash) throw new Error("incorrect password");
        const token = cratetokenForUser(user);
        return token;
});

const USER = model("user", userSchema);

module.exports = USER;