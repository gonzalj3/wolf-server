import mongoose from 'mongoose';
import Query from '../models/Query.js';

/* @desc: The Player schema.
 */

const Player = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'is required'],
  },
  team: {
    type: String,
  },
  queries: [
    Query.schema,
    /*{
      type: mongoose.Schema.ObjectId,
      ref: "Query",
      default: [],
    },*/
  ],
  responses: [String],
  createAt: {
    type: Date,
    default: Date.now(),
  },
  socket: {
    type: String,
  },
  handRaised: {
    type: Boolean,
    default: false,
  },
});
export default mongoose.model('Player', Player);
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
};

export default mongoose.model("Teacher", Teacher);*/
