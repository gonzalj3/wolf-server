import express from "express";
let router = express.Router();
import { currentGame } from "../controllers/game.js";
import { isAuth } from "../middlewares/authorization.js";

router.use(isAuth);
router.get("/current", currentGame);

export default router;
