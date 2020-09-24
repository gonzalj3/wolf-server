import models, { connectDB } from "../src/models/index.js";
import Game from "../src/models/Game.js";
import Team from "../src/models/Team.js";
import Player from "../src/models/Player.js";

let games = [];
let initialData;
connectDB().then(async () => {
  const player = await Player.create({
    name: "Test",
    queries: [],
  });

  const team = await Team.create({
    students: [player.name],
    color: "blue",
    name: "blue",
    score: 2,
  });

  const game = await Game.create({
    gameCode: 234,
    roster: [{ id: player._id, name: player.name }],
    teams: [team],
    queries: [],
  });
  //console.log(game);
  games.push(game);
  //We will take the last added game in Teacher's games array.
  const gameFound = await Game.findById(games[games.length - 1]);
  let returnData = {
    droppable: {},
    TeamOrder: [],
  };
  //let droppable = {};
  for (const teamID of gameFound.teams) {
    console.log("teamID", teamID);
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
    returnData.students[element._id] = {
      id: element._id,
      name: element.name,
    };
  });
  returnData.droppable["roster"] = {
    id: "roster",
  };

  returnData.droppable.roster.students = [];
  gameFound.roster.forEach((element) => {
    returnData.droppable.roster.students.push(element.name);
  });
  console.log(
    "droppable.roster.students",
    returnData.droppable.roster.students
  );
  console.log("returnData", returnData);
  initialData = returnData;
  console.log("initialData", initialData);
});
export default initialData;

/*returnData.droppable = {

  }*/
//console.log(team);
