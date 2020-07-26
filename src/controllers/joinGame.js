import Game from "../models/Game.js";

const joinGame = async (req, res, next) => {
  console.log("we got req", req);
  let code = req.body.gameCode;
  let game = await Game.findOne({
    gameCode: code,
  });

  console.log("we have a game", game);
  let returnData = {
    we: "good",
  };
  res.status(200).json(returnData);
};

export { joinGame };
