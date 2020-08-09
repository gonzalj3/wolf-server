import express from "express";
import { joinGame } from "../controllers/joinGame.js";

let router = express.Router();

router.post("/student", joinGame);

export default router;
