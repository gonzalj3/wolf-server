import Game from "../models/Game.js";
//import User from "../models/User.js";
import Team from "../models/Team.js";

const joinGame = async (data) => {
  console.log("message", data);
  let code = data.gameCode;

  let gameFound = null;

  gameFound = await Game.findOne({
    gameCode: code,
  });

  console.log("gamefound", gameFound);

  let returnData = {
    droppable: {},
    TeamOrder: [],
    gameCode: gameFound.gameCode,
  };
  for (const teamID of gameFound.teams) {
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

  console.log("sending data", returnData, "just sent");
  return returnData;
};

export { joinGame };
