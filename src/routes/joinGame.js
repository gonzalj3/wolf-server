import express from "express";
import { joinGame } from "../controllers/joinGame.js";
import { currentGame } from "../controllers/game.js";
//import { isAuth } from "../middlewares/authorization.js";
let router = express.Router();
//router.get(isAuth);
//console.log("routing through joingame");
router.post("/student", joinGame, currentGame);

export default router;
