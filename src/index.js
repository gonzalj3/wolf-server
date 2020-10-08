import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./models/index.js";
import { setUpSockets } from "./sockets/indexSockets.js";
import { errorHandler } from "./util/errorResponse.js";

import cookieParser from "cookie-parser";

import router from "./routes/autRoutes.js";
import gameRouter from "./routes/game.js";
import joinGameRouter from "./routes/joinGame.js";

const { json, urlencoded } = express;

dotenv.config();

const app = express();
const whitelist = [
  "http://192.168.1.38",
  "http://192.168.1.38:3000",
  "https://testwolffe.herokuapp.com",
  "https://wolfgamebeta.herokuapp.com",
];
var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};
/*app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);*/
//app.use(cors(corsOptions));

app.use(cors());

app.use(cookieParser());
app.use(json());
app.use(urlencoded({ extended: true }));

app.use("/api", router);
app.use("/api/game/", gameRouter);
app.use("/api/joinGame/", joinGameRouter);
app.use(errorHandler);

connectDB().then(async () => {
  app.listen(process.env.PORT, () =>
    console.log(`express app listening on port ` + process.env.PORT)
  );
  setUpSockets();
});
