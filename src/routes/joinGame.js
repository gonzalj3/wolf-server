import express from "express";
import { joinGame } from "../controllers/joinGame.js";
//import { isAuth } from "../middlewares/authorization.js";
let router = express.Router();
//router.get(isAuth);
router.post("/student", joinGame);

export default router;
