import http from "http";
import express from "express";
import socketio from "socket.io";
import Game from "../models/Game.js";
import Team from "../models/Team.js";
import Player from "../models/Player.js";
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

            socket.emit("joinGameRoom", returnData);
            return;
          }
        }
      }
      let newUser = await Player.create({
        name: data.name,
        team: null,
      });
      await newUser.save();
      let game = await Game.findOneAndUpdate(
        { gameCode: data.room },
        {
          $addToSet: {
            roster: [{ id: newUser._id, name: newUser.name }],
          },
        }
      );
      await game.save();
      let returnData = await GetGameData(data.room);
      console.log("about to socket over data: ", returnData);
      socket.emit("joinGameRoom", returnData);

      console.log(`teacherSocket: ${game.teacherSocket}`);
      socket.to(game.teacherSocket).emit("newStudent", returnData);
    });
    socket.on("gameTime", async (room) => {
      console.log("got message on gameTime: ", message);
    });
    socket.on("moveStudent", async (data) => {
      console.log(data);

      let game = await Game.findOne({
        gameCode: data.gameCode,
      });
      let gameRoster = game.roster;
      if (data.team == "roster") {
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
        for (const element of gameRoster) {
          //console.log("element name is :", element.name);
          if (element.id == data.student) {
            console.log("the team we have is", data.team);
            await Team.findOneAndUpdate(
              { _id: data.team },
              {
                $addToSet: {
                  students: [{ id: data.student, name: element.name }],
                },
              }
            );
          }
        }
        console.log("the game we started with: ", game);
        console.log(`studentID : ${data.student}`);
        //console.log("gameRoster");

        console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!", data.team);
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
            student.team = data.team;
          }
        }
        let updatedGame = await game.save();

        //Find the user and assign their property team to a team.
        await Player.findOneAndUpdate(
          {
            _id: data.student,
          },
          {
            team: data.team,
          }
        );

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
      if (data.team == "yellow") {
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
      } else if (data.team == "red") {
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
      } else if (data.team == "green") {
        const blue = await Team.create({
          students: [],
          color: "green",
          name: "green",
          score: 2,
        });
        await Game.findOneAndUpdate(
          { gameCode: data.room },
          {
            $addToSet: {
              teams: [blue],
            },
          }
        );
      } else if (data.team == "purple") {
        const purple = await Team.create({
          students: [],
          color: "purple",
          name: "purple",
          score: 2,
        });
        await Game.findOneAndUpdate(
          { gameCode: data.room },
          {
            $addToSet: {
              teams: [purple],
            },
          }
        );
      } else if (data.team == "orange") {
        const orange = await Team.create({
          students: [],
          color: "orange",
          name: "orange",
          score: 2,
        });
        await Game.findOneAndUpdate(
          { gameCode: data.room },
          {
            $addToSet: {
              teams: [orange],
            },
          }
        );
      }
      //let returnData = await GetGameData(data.room);

      //socket.emit("newTeamUpdate", returnData);
      let returnData = await GetGameData(data.room);

      gameSocket.in(data.room).emit("newTeamUpdate", returnData);
    });
  });
};

export { setUpSockets };
