import mongoose from "mongoose";

const Query = new mongoose.Schema({
  type: String,
  question: String,
  answer: String,
  scored: { type: Boolean, default: false },
});

export default mongoose.model("Query", Query);
