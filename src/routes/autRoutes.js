import express from "express";
let router = express.Router();
import {
  registerController,
  logInController,
  joinGameController,
} from "../controllers/aut.js";
import expressValidator from "express-validator";

const { check } = expressValidator;

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

router.post("/joinGame", joinGameController);

export default router;
