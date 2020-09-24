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
        //We first find/change the player's team property.
        let studentUpdated = await Player.findOneAndUpdate(
          {
            _id: data.student,
          },
          {
            team: null,
          },
          {
            new: true,
          }
        );
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
              { _id: team },
              {
                $pull: { students: { id: data.student } },
              }
            );
          }
        }
      } else {
        let teamName = null;
        for (const element of gameRoster) {
          //console.log("element name is :", element.name);
          if (element.id == data.student) {
            console.log("the team we have is", data.to, data.from);
            teamName = await Team.findOneAndUpdate(
              { _id: data.to },
              {
                $addToSet: {
                  students: [{ id: data.student, name: element.name }],
                },
              }
            );
            await Team.findOneAndUpdate(
              { _id: data.from },
              {
                $pull: {
                  students: { id: data.student },
                },
              }
            );
          }
        }
        console.log("the game we started with: ", game);
        console.log(`studentID : ${data.student}`);
        //console.log("gameRoster");

        console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!", data.to);
        /*await game.updateOne(
          { "roster.id": data.student },
          {
            $set: { "roster.$.team": data.team },
          }
        );*/
        for (let student of game.roster) {
          if (student.id == data.student) {
            console.log(
              "******** we have found a student and are updting team *********"
            );
            student.team = teamName.name;
          }
        }
        game.markModified("roster");

        let updatedGame = await game.save();

        //Find the user and assign their property team to a team.
        /*await Player.findOneAndUpdate(
          {
            _id: data.student,
          },
          {
            team: data.to,
          }
        );*/

        /*await Game.findOneAndUpdate(
          { gameCode: data.gameCode },
          {
            $pull: { roster: { id: data.student } },
          }
        );*/
        //let game222 = await Game.findOne({ gameCode: data.gameCode });

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

          let game = await Game.findOneAndUpdate(
            { gameCode: data.gameCode },
            {
              $addToSet: {
                queries: [tfQuestion],
              },
            },
            { new: true }
          );

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
  });
};

export { setUpSockets };
