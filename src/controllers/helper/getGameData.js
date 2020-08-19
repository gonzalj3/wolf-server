import Game from "../../models/Game.js";
import User from "../../models/User.js";
import Team from "../../models/Team.js";
import { ErrorResponse } from "../../util/errorResponse.js";

const GetGameData = async (gameCode) => {
  let gameFound = null;
  gameFound = await Game.findOne({ gameCode: gameCode });
  if (gameFound == null) {
    return null;
  }

  /*Set Up Container to Return Data*/
  let returnData = {
    droppable: {},
    TeamOrder: [],
    gameCode: gameFound.gameCode,
  };

  for (const teamID of gameFound.teams) {
    let team = await Team.findById(teamID);
    console.log("students array: ", team.students);
    returnData.droppable = {
      [teamID]: {
        id: teamID,
        name: team.name,
        score: team.score,
        color: team.color,
        students: team.students,
      },
    };
    returnData.TeamOrder.push(teamID);
  }
  returnData.students = {};
  gameFound.roster.forEach((element) => {
    console.log(
      "making roster with: ",
      element._id,
      element.name,
      element.team
    );
    //ensure that the player is not part of a team.
    //if (!element.team) {
    returnData.students[element.id] = {
      id: element.id,
      name: element.name,
      //};
    };
  });
  returnData.droppable["roster"] = {
    id: "roster",
  };

  returnData.droppable.roster.students = [];
  gameFound.roster.forEach((element) => {
    if (!element.team) {
      returnData.droppable.roster.students.push(element.id);
    }
  });
  console.log("returnDAta: ", returnData);
  return returnData;
};

export default GetGameData;
