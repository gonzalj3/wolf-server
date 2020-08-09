import Game from "../models/Game.js";
import GetGameData from "./helper/getGameData.js";
import { ErrorResponse, errorFormater } from "../util/errorResponse.js";

const joinGame = async (req, res, next) => {
  if (req.body.gameCode) {
    let gameFound = await Game.findOne({
      gameCode: req.body.gameCode,
    });
    //console.log("gameFound", gameFound);
    if (gameFound != null) {
      for (let index = 0; index < gameFound.roster.length; index++) {
        if (gameFound.roster[index].name === req.body.nickName) {
          //console.log("A player with that name already exists in the game.");
          const error = new ErrorResponse(
            "Someone already has that name in the game.",
            500
          );
          next(error);
          //return null;
        }
      }
    } else {
      const error = new ErrorResponse(
        "We could not find a game for this code",
        500
      );
      next(error);
    }

    let returnData = await GetGameData(req.body.gameCode);
    res.status(200).json(returnData);
  } else {
    const error = new ErrorResponse(
      "Please provide a game code to join a Game",
      500
    );
    next(error);
  }
};

export { joinGame };
