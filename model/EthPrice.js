const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const priceSchema = new Schema({
  id: { type: Number, required: true, default: 1 },
  currPrice: { type: Number, required: true },
});

module.exports = mongoose.model("Price", priceSchema);
