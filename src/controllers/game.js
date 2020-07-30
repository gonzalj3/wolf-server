import Game from "../models/Game.js";
import User from "../models/User.js";
import Team from "../models/Team.js";

const currentGame = async (req, res, next) => {
  //let initialData;
  let gameFound = null;

  console.log("req gameCode", req.body.gameCode);
  //console.log("request received", req);
  //If we dont have a gameCode in the request then we are a teacher setting up a game.
  if (req.body.gameCode) {
    gameFound = await Game.findOne({
      gameCode: req.body.gameCode,
    });
    console.log("gameFound", gameFound);
  } else {
    let exist = await User.findOne({
      email: req.user.email,
    });
    let currentGame = exist.currentGame;
    console.log("currentGame", currentGame);
    gameFound = await Game.findById(currentGame);
  }
  console.log("gamefound", gameFound);

  let returnData = {
    droppable: {},
    TeamOrder: [],
    gameCode: gameFound.gameCode,
  };
  //let droppable = {};
  for (const teamID of gameFound.teams) {
    //console.log("teamID", teamID);
    let name = await Team.findById(teamID);
    returnData.droppable = {
      [name.name]: {
        id: name._id,
        name: name.name,
        score: name.score,
        color: name.color,
        students: name.students,
      },
    };
    returnData.TeamOrder.push(name.name);
  }
  returnData.students = {};
  gameFound.roster.forEach((element) => {
    console.log(returnData.students, "insideforeach", element._id);
    returnData.students[element.id] = {
      id: element.id,
      name: element.name,
    };
  });
  returnData.droppable["roster"] = {
    id: "roster",
  };

  returnData.droppable.roster.students = [];
  gameFound.roster.forEach((element) => {
    returnData.droppable.roster.students.push(element.id);
  });
  console.log(
    "droppable.roster.students",
    returnData.droppable.roster.students
  );
  console.log("returnData", returnData);
  //initialData = returnData;
  //console.log("initialData", initialData);
  /*console.log(req);
  const output = {};
  output.hello = "world";
  console.log(output);
  res.status(200).json(initialData);*/
  console.log("sending data", returnData, "just sent");
  res.status(200).json(returnData);
};

export { currentGame };
