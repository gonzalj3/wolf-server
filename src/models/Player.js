import mongoose from "mongoose";

/* @desc: The Player schema.
 */

const Player = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "is required"],
  },
  team: {
    type: String,
  },
  queries: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Query",
      default: [],
    },
  ],
  createAt: {
    type: Date,
    default: Date.now(),
  },
});
export default mongoose.model("Player", Player);
/* @desc: Before saving the user instance/document the password is hashed.
 * @param: next
 * @returns: none
 */
/*User.pre("save", async function (next) {
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
/*User.methods.comparePassword = function (enteredPassword, result) {
  bcryptjs.compare(enteredPassword, this.password, function (err, isMatch) {
    if (err) {
      console.log(err);
      return result(err);
    }
    console.log(isMatch);
    result(null, isMatch);
  });
};

export default mongoose.model("User", User);*/
