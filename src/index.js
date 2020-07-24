import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import models, { connectDB } from "./models/index.js";

import cookieParser from "cookie-parser";
import jsonwebtoken from "jsonwebtoken";
import bcryptjs from "bcryptjs";

import router from "./routes/autRoutes.js";
import gameRouter from "./routes/game.js";
import { errorHandler } from "./util/errorResponse.js";
const { verify } = jsonwebtoken;
const { hash, compare } = bcryptjs;
const { json, urlencoded } = express;
dotenv.config();

const app = express();
app.use(cookieParser());
app.use(json());
app.use(urlencoded({ extended: true }));
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
/*app.get(
  "/api",
  (req, res, next) => {
    console.log(req.body, "working");
  },
  router
);*/

app.use("/api", router);
app.use("/api/game/", gameRouter);
app.use(errorHandler);

connectDB().then(async () => {
  app.listen(process.env.PORT, () =>
    console.log(`express app listening on port ` + process.env.PORT)
  );
});
