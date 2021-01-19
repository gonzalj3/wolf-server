import Game from '../../models/Game.js';
import Teacher from '../../models/Teacher.js';
import Team from '../../models/Team.js';
import { ErrorResponse } from '../../util/errorResponse.js';

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

  for (const team of gameFound.teams) {
    //let team = await Team.findById(teamID);
    //console.log("team ", team.name, team);
    (returnData.droppable[team._id] = {
      id: team._id,
      name: team.name,
      score: team.score,
      color: team.color,
      students: team.students,
    }),
      returnData.TeamOrder.push(team._id);
  }
  returnData.students = {};
  gameFound.roster.forEach((element) => {
    returnData.students[element.id] = {
      id: element.id,
      name: element.name,
      hand: element.handRaised,
    };
  });
  returnData.droppable['roster'] = {
    id: 'roster',
  };
  //Begin the process to populate  the students array inside the droppable roster object.
  returnData.droppable.roster.students = [];
  gameFound.roster.forEach((element) => {
    if (!element.team) {
      returnData.droppable.roster.students.push(element.id);
    }
  });
  //Passing the current question.
  if (gameFound.queries.length > 0) {
    returnData.question = {
      type: gameFound.queries[gameFound.queries.length - 1].type,
      index: gameFound.queries.length - 1,
      answer: gameFound.queries[gameFound.queries.length - 1].answer,
      scored: gameFound.queries[gameFound.queries.length - 1].scored,
    };
  } else {
    returnData.question = null;
  }
  //Passing Last Question Action.
  returnData.lastAction = gameFound.lastAction;

  //Returning all current game query responses, by first checking that we have a current question in progress.
  //console.log("queries : ", gameFound.queries);
  if (
    gameFound.queries.length > 0 &&
    !gameFound.queries[gameFound.queries.length - 1].answer
  ) {
    returnData.responses = [];
    gameFound.roster.forEach((item, index) => {
      //ensure that a response exists for the current query and if so provide it to the teachers front end to print out
      let teamName = '';
      if (item.team != null) {
        teamName = item.team;
      }
      if (item.responses[gameFound.queries.length - 1]) {
        returnData.responses.push({
          name: item.name,
          team: teamName,
          response: item.responses[gameFound.queries.length - 1],
        });
      }
    });
  }
  //console.log("returnDAta: ", returnData);
  return returnData;
};

export default GetGameData;
