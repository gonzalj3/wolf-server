import Game from "../../models/Game.js"
import GetGameData from "../helper/getGameData.js"

const calculateScores = (gameCode, index, answer) => {
    if (gameCode && index >= 0) {
        console.log("we are inside of the if loop ");
        //We will find the query and mark it as scored
        let game = await Game.findOne({ gameCode: gameCode });
        let query = game.queries[index];
        query.scored = true;
        query.answer = answer;
        game.markModified("queries");
        await game.save();
        console.log(
          "************************** we have updated the scores ***********************"
        );
        let teamPoints = teamScores(game.roster,game.teams, index, answer)
        
        for(const team in teamPoints){
          console.log(`teh team is : ${team}, and the object is ${teamPoints[team].correct}   ${teamPoints[team].players}`)
          let target = game.teams.filter((teamData) => {
            console.log(team, teamData.name)
            return(team === teamData.name)
          })
          //console.log("target ", target[0])
          let scoreUpdate = Math.round(teamPoints[team].correct / teamPoints[team].players * 10) + target[0].score
          console.log("the score is : ", scoreUpdate)

          if(scoreUpdate){
            target[0]["score"] = scoreUpdate
            console.log("target ", JSON.stringify(target))
            game.markModified("teams");
            await game.save();
            console.log(" game ", game.teams)
          }
        }
        //console.log(`the team players ${teamPoints}, and the number correct ${teamPoints.correct}`)

        game.lastAction = "point"

        await game.save();
        let returnData = await GetGameData(gameCode);
        //Need to change the code below.
        gameSocket.in(gameCode).emit("setAnswerUpdate", returnData);
    }
}

//function returns an object. keys are team names and value is an object with the keys being name, players, correct responses.
//parameters: game (we need the roster and the teams arrays/irritatives) and index of question. index of the question and the correct answer
const teamScores = (roster, teams, index, answer) => {
    let teamPoints = {}
    for (let student of roster) {
        //Find the team that matches the student's team
        console.log("the student ", student)
        let team = teams.filter((team) => {
          console.log("team name, student name", team.name, student.team);
          if (student.team) {
            return team.name == student.team;
          } else {
            return false;
          }
        })
        //Use the team name to find team/key in teamPoints object and then assign to that team's player property either 1 or 1 Plus existing number
        console.log(`this is the team target ${team[0]}`)
        if(team[0]){
          //if we dont have an entry for a particular team we create one here
          if(!teamPoints[team[0].name]){
          teamPoints[team[0].name] = {name:team[0].name}
          }
          //we are going to count the number of players here. we either start at 1 or take the existing player count and add 1
          let players = teamPoints[team[0].name]["players"] + 1 || 1
          teamPoints[team[0].name] = 
          {
            ...teamPoints[team[0].name],
            players: players,

          }
          //console.log(`updated teamPoints at ${team[0].name} to ${teamPoints[team[0].name].players} and players is ${players}`)
          //Ensure the student answered the question
          if (student.responses[index]) {
            //Ensure the answer is correct
            if (answer == student.responses[index]) {

              //Assign points to.
                teamPoints[team[0].name] = 
                  {
                    ...teamPoints[team[0].name],
                    correct: teamPoints[team[0].name]["correct"] + 1 || 1
                  }
                  console.log("have updated teamPoints : ", team[0], teamPoints[team[0].name])
            }
          }
        }
    }
    return teamPoints
}