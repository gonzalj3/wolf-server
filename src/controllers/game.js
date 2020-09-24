import GetGameData from "./helper/getGameData.js";
import Teacher from "../models/Teacher.js";
import Game from "../models/Game.js";
import { ErrorResponse } from "../util/errorResponse.js";

const currentGame = async (req, res, next) => {
  let exist = await Teacher.findOne({
    email: req.user.email,
  });
  let currentGame = exist.currentGame;
  if (exist == null) {
    console.log("cant find user");
  }

  let gameFound = await Game.findById(currentGame);
  let returnData = await GetGameData(gameFound.gameCode);

  if (returnData == null) {
    let error = new ErrorResponse("An error occured finding your game.", 500);
    next(error);
  }
  res.status(200).json(returnData);
};

export { currentGame };
