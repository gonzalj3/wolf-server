import express from "express";
import websocket from "websocket";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import models, { connectDB } from "./models/index.js";

import cookieParser from "cookie-parser";
import jsonwebtoken from "jsonwebtoken";
import bcryptjs from "bcryptjs";

import router from "./routes/autRoutes.js";
import gameRouter from "./routes/game.js";
import joinGameRouter from "./routes/joinGame.js";
import { errorHandler } from "./util/errorResponse.js";
const { verify } = jsonwebtoken;
const { hash, compare } = bcryptjs;
const { json, urlencoded } = express;
const { server } = websocket;

dotenv.config();

/*Create Web Socket
 */
const serverWebSocket = http.createServer(express);

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
app.use("/api/joinGame/", joinGameRouter);
app.use(errorHandler);

connectDB().then(async () => {
  app.listen(process.env.PORT, () =>
    console.log(`express app listening on port ` + process.env.PORT)
  );

  serverWebSocket.listen(process.env.WEBSOCKETPORT, () =>
    console.log(" websocket listening on port " + process.env.WEBSOCKETPORT)
  );
  const wsServer = new server({ httpServer: serverWebSocket });

  wsServer.on("request", function (request) {
    console.log("got a handshake from " + request.origin);
    const connection = request.accept(null, request.origin);
    connection.on("message", function (message) {
      const json = { hello: "world" };
      //sendMessage(JSON.stringify(json));
      console.log("message", message);
    });
  });
});
