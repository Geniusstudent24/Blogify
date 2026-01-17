const { Schema, model } = require("mongoose");

const settingsSchema = new Schema({
    isMaintenance: {
        type: Boolean,
        default: false
    },
    updatedBy: {
        type: Schema.Types.ObjectId,
        ref: "user"
    }
}, { timestamps: true });

module.exports = model("settings", settingsSchema);
