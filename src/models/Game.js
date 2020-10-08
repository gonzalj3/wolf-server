import mongoose from "mongoose";
import Player from "../models/Player.js";
import Query from "../models/Query.js";
import Team from "../models/Team.js";

/* @desc: The Game schema. Contains arrays of other schemas.
 */

const Game = new mongoose.Schema({
  gameCode: {
    type: String,
    required: [true, "is required"],
    maxlength: [6, "game code can not be greater than 6 characters"],
    minlength: [4, "game code can not be less than 4 characters"],
    index: { unique: true },
  },
  teacherSocket: {
    type: String,
  },
  //The declaration for roster originally was roster:[Player.schema]
  roster: [Player.schema],
  teams: [Team.schema],
  queries: [
    Query.schema,

    /*{
      type: String,
      question: String,
      answer: String,
      type: mongoose.Schema.ObjectId,
      ref: "Query",
    default: [],
    },*/
  ],
  createAt: {
    type: Date,
    default: Date.now(),
  },
});

/* @desc: Before saving the user instance/document the password is hashed.
 * @param: next
 * @returns: none
 */
/*Teacher.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  const salt = await bcryptjs.genSalt(10);
  this.password = await bcryptjs.hash(this.password, salt);
  next();
});*/

/* @desc: Determines if the document's current password matches the passed password
 * utilized in functions to verify user's identity i.e. log-in.
 * @param: string
 * @returns: object
 */
/*Teacher.methods.comparePassword = function (enteredPassword, result) {
  bcryptjs.compare(enteredPassword, this.password, function (err, isMatch) {
    if (err) {
      console.log(err);
      return result(err);
    }
    console.log(isMatch);
    result(null, isMatch);
  });
};*/

export default mongoose.model("Game", Game);
