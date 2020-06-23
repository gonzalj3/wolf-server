import express from "express";
let router = express.Router();
import { registerController, logInController } from "../controllers/aut.js";
import expressValidator from "express-validator";

const { check } = expressValidator;

/*router.get("/", (req, res) => {
  console.log("from router");
  return res.send("whats up");
});*/

router.post(
  "/register",
  [
    check("email", "Enter a valid email.").isEmail(),
    check(
      "password",
      " Password should be at least 8 characters long."
    ).isLength({ min: 8 }),
  ],

  registerController
);

router.post(
  "/login",
  [
    check("email", "Enter a valid email.").isEmail(),
    check(
      "password",
      " Password should be at least 8 characters long."
    ).isLength({ min: 8 }),
  ],
  logInController
);

export default router;
