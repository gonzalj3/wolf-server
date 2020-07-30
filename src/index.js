import express from "express";
import socketio from "socket.io";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./models/index.js";
import { errorHandler } from "./util/errorResponse.js";

import cookieParser from "cookie-parser";

import router from "./routes/autRoutes.js";
import gameRouter from "./routes/game.js";
import joinGameRouter from "./routes/joinGame.js";

/* Need to figure out a way to seperate out the functions that would exist in a controller*/
//import Game from "./models/Game.js";

import { joinGame } from "./controllers/joinGame.js";
//import { teacherGame } from "./controllers/teacherGame.js";

const { json, urlencoded } = express;

dotenv.config();

/*Create Web Socket
 */
const serverWebSocket = http.createServer(express);
const io = socketio(serverWebSocket);

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
  io.on("connection", (socket) => {
    console.log("new client connected");
    //let studentCode = null;
    socket.on("studentServer", async (data) => {
      let studentGame = await joinGame(data);
      //let teacherUpdate = await teacherGame(data);
      console.log(studentGame);
      socket.emit("studentClient", studentGame);
      socket.emit("teacherClient");
    });

    socket.on("disconnect", () => console.log("client disconnected"));
  });
});
