const { ExpressionType } = require("@aws-sdk/client-s3");
const mongoose = require("mongoose");
const { Schema } = mongoose;

const subscriptionSchema = new Schema({
  endpoint: { type: String, required: true, unique: true },
  expirationTime: { type: Schema.Types.Mixed, default: null },
  keys: {
    p256dh: { type: String, required: true },
    auth: { type: String, required: true },
  },
});

const Subscription = mongoose.model("Subscription", subscriptionSchema);

module.exports = Subscription;
