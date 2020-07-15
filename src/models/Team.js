import mongoose from "mongoose";

/* @desc: The Team schema.
 */

const Team = new mongoose.Schema({
  teamRoster: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Player",
    },
  ],
  color: {
    type: String,
    required: [true, "is required"],
  },
  name: {
    type: String,
    required: [true, "is required"],
  },
  score: {
    type: Number,
  },
  createAt: {
    type: Date,
    default: Date.now(),
  },
});

export default mongoose.model("Team", Team);
