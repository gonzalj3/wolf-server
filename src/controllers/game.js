import Game from "../models/Game.js";
import User from "../models/User.js";

import initialData from "../data/initial-data.js";
const currentGame = async (req, res, next) => {
  console.log(req);
  const output = {};
  output.hello = "world";
  console.log(output);
  res.status(200).json(initialData);
};

export { currentGame };
