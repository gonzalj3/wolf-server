import Game from "../models/Game.js";
import User from "../models/User.js";
import Team from "../models/Team.js";
import Player from "../models/Player.js";
//import initialData from "../../test/dummyData.js";
//import initialData from "../data/initial-data.js";

const currentGame = async (req, res, next) => {
  //let initialData;
  let games = [];

  const player = await Player.create({
    name: "Test",
    queries: [],
  });
  const playerID = player._id;
  console.log("playerID 1", playerID);
  let roster = { id: playerID, name: player.name };
  console.log("playerID 2", playerID);

  const team = await Team.create({
    students: [playerID],
    color: "blue",
    name: "blue",
    score: 2,
  });
  console.log("playerID in team stduens", team.students);
  console.log("roster", roster);
  const game = await Game.create({
    gameCode: 44488,
    roster: [roster],
    teams: [team],
    queries: [],
  });
  console.log("game roster", game.roster);
  games.push(game);
  //We will take the last added game in User's games array.
  const gameFound = await Game.findById(games[games.length - 1]);
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
