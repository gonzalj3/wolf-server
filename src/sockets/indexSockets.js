import http from "http";
import express from "express";
import socketio from "socket.io";
import Game from "../models/Game.js";
import Team from "../models/Team.js";
import Player from "../models/Player.js";
import Query from "../models/Query.js";
import GetGameData from "../controllers/helper/getGameData.js";

const setUpSockets = () => {
  const serverWebSocket = http.createServer(express);
  const io = socketio(serverWebSocket);

  serverWebSocket.listen(process.env.WEBSOCKETPORT, () =>
    console.log(" websocket listening on port " + process.env.WEBSOCKETPORT)
  );

  let gameSocket = io.of("/game");
  let teacherID = null;
  gameSocket.on("connection", (socket) => {
    //Teachers joins a room
    socket.on("registerSocket", async (gameData) => {
      console.log("gameData is : ", gameData);
      console.log("teacher Socket ID", socket.id);
      console.log("type of socket: ", typeof socket.id);
      if (gameData != null) {
        let document = await Game.findOneAndUpdate(
          { gameCode: gameData.gameCode },
          { teacherSocket: socket.id }
        );
        console.log(`socket ${document.teacherSocket} `);
      }
      socket.join(gameData.gameCode);
    });

    //Student joins a game here.
    socket.on("joinGameRoom", async (data) => {
      console.log("student joining game socket id", socket.id);
      socket.join(data.room);

      //console.log(`student data ${data}`);
      console.log("!!!!!!!!!!!student name: ", data.name);
      let gameFound = await Game.findOne({
        gameCode: data.room,
      });

      if (gameFound != null) {
        for (let index = 0; index < gameFound.roster.length; index++) {
          if (gameFound.roster[index].name === data.name) {
            console.log("A player with that name already exists in the game.");
            let returnData = await GetGameData(data.room);

            socket.emit("gameData", returnData);
            return;
          }
        }
      }
      let newUser = await Player.create({
        name: data.name,
        team: null,
        queries: [],
        responses: [],
      });
      await newUser.save();
      gameFound.queries.forEach((item, index) => {
        newUser.queries.push(item);
        newUser.responses.push(null);
      });
      await newUser.save();
      let game = await Game.findOneAndUpdate(
        { gameCode: data.room },
        {
          $addToSet: {
            roster: [newUser],
          },
        }
      );
      await game.save();
      let returnData = await GetGameData(data.room);
      console.log("about to socket over data: ", returnData);
      socket.emit("gameData", returnData);

      console.log(`teacherSocket: ${game.teacherSocket}`);
      socket.to(game.teacherSocket).emit("newStudent", returnData);
    });
    socket.on("gameTime", async (room) => {
      console.log("got message on gameTime: ", message);
    });
    socket.on("moveStudent", async (data) => {
      console.log("moving student with data : ", data);

      let game = await Game.findOne({
        gameCode: data.gameCode,
      });
      let gameRoster = game.roster;
      if (data.to == "roster") {
        for (let student of game.roster) {
          if (student.id == data.student) {
            student.team = "team";
          }
        }
        game.markModified("roster");

        await game.save();
        //We then find the student in the game's rosters array of object and update that student objet property team.
        for (let student of game.roster) {
          if (student.id == data.student) {
            console.log(
              "******** we have found a student and are updting team *********"
            );
            let team = student.team;
            student.team = null;
            let updatedGame = await game.save();
            //We then find the team and update that roster as well.
            await Team.findOneAndUpdate(
              { _id: data.from },
              {
                $pull: { students: { id: data.student } },
              }
            );
          }
        }
      } else {
        const status = await Promise.all(
          gameRoster.map((student) => {
            if (student.id == data.student) {
              let team = Team.findOneAndUpdate(
                { _id: data.to },
                {
                  $addToSet: {
                    students: [{ id: data.student, name: student.name }],
                  },
                }
              );
              //teamName = team.name;
              return team;
            }
          })
        );

        const status2 = await Promise.all(
          gameRoster.map((student) => {
            if (student.id == data.student) {
              if (data.from !== "roster") {
                let oldTeam = data.from;

                let team = Team.findOneAndUpdate(
                  { _id: oldTeam },
                  {
                    $pull: {
                      students: { id: data.student },
                    },
                  }
                );

                return team;
              }
            }
          })
        );
        console.log("the status for both promises : ", status, status2);
        let team = status.find((team) => team != undefined);
        //So in order to get the student to not appear on the unassigned roster bar we will give that student element in the roster array a team name of "team"
        for (let student of game.roster) {
          if (student.id == data.student) {
            student.team = team.name;
            console.log("studnet team i now : ", student.team);
          }
        }
        game.markModified("roster");

        let updatedGame = await game.save();
        console.log("the game we ended", updatedGame);
      }
    });
    socket.on("newTeam", async (data) => {
      let game = await Game.findOne({
        gameCode: data.room,
      });

      if (game.teams.length == 1) {
        const yellow = await Team.create({
          students: [],
          color: "yellow",
          name: "yellow",
          score: 0,
        });
        //yellow.save();
        await Game.findOneAndUpdate(
          { gameCode: data.room },
          {
            $addToSet: {
              teams: [yellow],
            },
          }
        );
      } else if (game.teams.length == 2) {
        const red = await Team.create({
          students: [],
          color: "red",
          name: "red",
          score: 0,
        });
        await Game.findOneAndUpdate(
          { gameCode: data.room },
          {
            $addToSet: {
              teams: [red],
            },
          }
        );
      } else if (game.teams.length == 3) {
        const green = await Team.create({
          students: [],
          color: "green",
          name: "green",
          score: 0,
        });
        await Game.findOneAndUpdate(
          { gameCode: data.room },
          {
            $addToSet: {
              teams: [green],
            },
          }
        );
      } /*else if (game.teams.length == 4) {
        const purple = await Team.create({
          students: [],
          color: "purple",
          name: "purple",
          score: 0,
        });
        await Game.findOneAndUpdate(
          { gameCode: data.room },
          {
            $addToSet: {
              teams: [purple],
            },
          }
        );
      } else if (game.teams.length == 5) {
        const orange = await Team.create({
          students: [],
          color: "orange",
          name: "orange",
          score: 0,
        });
        await Game.findOneAndUpdate(
          { gameCode: data.room },
          {
            $addToSet: {
              teams: [orange],
            },
          }
        );
      }*/

      let returnData = await GetGameData(data.room);
      gameSocket.in(data.room).emit("newTeamUpdate", returnData);
    });
    socket.on("newQuestion", async (data) => {
      console.log(data);
      switch (data.type) {
        case "TF":
          const tfQuestion = await Query.create({
            type: "TF",
          });
          //need to add logic here so that if the last question in the array
          //queries from game model has an unanswered portion we simply replace that one instead of adding a new one
          let game = await Game.findOne({ gameCode: data.gameCode });
          if (game.queries[game.queries.length - 1].answer == null) {
            game.queries[game.queries.length - 1].type = "TF";
          } else {
            let game = await Game.findOneAndUpdate(
              { gameCode: data.gameCode },
              {
                $addToSet: {
                  queries: [tfQuestion],
                },
              },
              { new: true }
            );
          }

          /*game.roster.forEach((item, index) => {
            item.queries.push(tfQuestion);
            console.log("the queries of a student", item.queries);

            //item.save();
          });*/
          await game.save();
          let returnData = await GetGameData(data.gameCode);
          gameSocket.in(data.gameCode).emit("newQuestionUpdate", returnData);
        //console.log("we have TF");
      }
    });
    socket.on("setAnswer", async (data) => {
      /* Determine type of question, find game and the last query from queries array. 
      Update the game with new answer and update this for each student as well. 
      Websocket to all the students in teh room with new data. 
      */
      switch (data.type) {
        case "TF":
          let game = await Game.findOne({ gameCode: data.gameCode });
          console.log("game is: ", game);
          let lastQuestion = game.queries[game.queries.length - 1];
          console.log("here is the last question : ", lastQuestion);

          if (lastQuestion) {
            lastQuestion.answer = data.answer;
          }
          await game.save();

          console.log("here is the last question : ", lastQuestion);
          //May just remove teh queries for each student since we already store data.
          await game.save();
          let returnData = await GetGameData(data.gameCode);
          //Need to change the code below.
          gameSocket.in(data.gameCode).emit("setAnswerUpdate", returnData);
      }
    });
    socket.on("studentAnswer", async (data) => {
      console.log("student :", data);
      let game = await Game.findOne({ gameCode: data.gameCode });
      console.log("game found: ", game);
      console.log("");
      var studentFound = game.roster.filter((student) => {
        //console.log("")
        return student.name === data.student;
      });
      game.roster;
      console.log("the student found: ", studentFound);
      let lastQuestion = game.queries[game.queries.length - 1];

      //we need to ensure that we do not have an answer provided by the teacher we do this by looking at the answer property.
      if (lastQuestion && !lastQuestion.answer) {
        console.log("we have no teacher saved answer");
        if (!studentFound[0].responses) {
          console.log("savign student response1");

          studentFound[0].responses = [];
          console.log("game.queries.length - 1 :", game.queries.length - 1);
          studentFound[0].responses[game.queries.length - 1] = data.answer;
          console.log(studentFound, data.answer);
          await game.save((err, obj) => {
            if (err) {
              console.log("error: ", err);
            }
            console.log("gamesave ", obj.responses);
          });
        } else {
          console.log("savign student response");
          studentFound[0].responses[game.queries.length - 1] = data.answer;

          let savedStudent = await studentFound[0].save();
          savedStudent.markModified("responses");
          let savedGame = await game.save();
          console.log("saved game: ", savedGame.roster);
          console.log("saved student: ", savedStudent);
        }
      }
      /*for (let index = 0; index <= game.roster.length - 1; index++) {
        let item = game.roster[index];
        if (item.name == data.student) {
          //we have found the student we want
          //let lastQuestion = item.queries[item.queries.length - 1];
          let lastQuestion = game.queries[game.queries.length - 1];

          //we need to ensure that we do not have an answer provided by the teacher we do this by looking at the answer property.
          if (lastQuestion && !lastQuestion.answer) {
            //lastQuestion.answer = data.answer;
            console.log(
              "response before change",
              item.responses[game.queries.length - 1],
              item.responses,
              game.queries.length
            );

            if (!item.responses) {
              item.responses = [];
              item.responses[game.queries.length - 1] = data.answer;
              await game.save();
            } else {
              item.responses[game.queries.length - 1] = data.answer;
              await game.save();
            }
          }
        }
      }*/

      let populateReturnData = new Promise(async (resolve, reject) => {
        let returnData = [];

        game.roster.forEach((item, index) => {
          //ensure that a response exists for the current query and if so provide it to the teachers front end to print out
          if (item.responses[game.queries.length - 1]) {
            /*returnData.name.push(item.name);
            returnData.team.push(item.team);
            returnData.response.push(item.responses[game.queries.length - 1]);*/
            let teamName = "";
            if (item.team != null) {
              teamName = item.team;
            }
            returnData.push({
              name: item.name,
              team: teamName,
              response: item.responses[game.queries.length - 1],
            });
          }
        });

        resolve(returnData);
      });
      populateReturnData.then(async (data) => {
        console.log("data in then :", data);

        socket.to(game.teacherSocket).emit("newStudentAnswer", data);
        console.log("we have sent returnData ");
      });

      //we need to communicate to the teacher here that we got new info for a student
    });
    socket.on("cancelQuestion", async (data) => {
      if (data.gameCode && data.index) {
        let game = await Game.findOne({ gameCode: data.gameCode });
        game.queries[data.index].type = null;
        game.queries[data.index].answer = null;
        game.save();
      }
    });
  });
};

export { setUpSockets };
