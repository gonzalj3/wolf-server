import Teacher from "../models/Teacher.js";
import Game from "../models/Game.js";
import Team from "../models/Team.js";
import { randomGameCode } from "../util/randomGameCode.js";

import { ErrorResponse, errorFormater } from "../util/errorResponse.js";
import { accessToken } from "../util/tokens.js";
import expressValidator from "express-validator";

const { validationResult } = expressValidator;
/* @desc: registerController takes a request and validates email and password.
 * As well, determines if user already exists via email and if one does not exists
 * a new user document is created and returned within a JSON object without
 * the password along with a JWT.
 * @param: req, res, next
 * @returns: none
 */

const registerController = async (req, res, next) => {
  console.log("registering!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
  const err = validationResult(req).formatWith(errorFormater);
  if (!err.isEmpty()) {
    const error = new ErrorResponse(err.array(), 401);
    return next(error);
  }

  const { email, firstName, lastName, schoolName, password } = req.body;
  try {
    //let existance = false;
    let exist = await Teacher.findOne(
      {
        email: email,
      },
      function (err, userExistance) {
        if (err) {
          const error = new ErrorResponse(
            "Error in database finding user.",
            500
          );
          return next(error);
        } else if (userExistance) {
          //existance = userExistance;
          const error = new ErrorResponse("Teacher Already Exists.", 403);
          return next(error);
        } else {
          console.log("finish looking for user");
        }
      }
    ).exec();

    //console.log("about to create a user");
    if (!exist) {
      let currentCode;

      let gameCodeExistance;
      let enterLoop = true;
      while (!gameCodeExistance && enterLoop) {
        currentCode = randomGameCode(5);

        gameCodeExistance = Game.findOne({
          gameCode: currentCode,
        });
        enterLoop = gameCodeExistance ? false : true;
      }

      console.log("we are about to create team");
      const blue = await Team.create({
        students: [],
        color: "#3382C9",
        name: "blue",
        score: 0,
      });
      const yellow = await Team.create({
        students: [],
        color: "#EEE657",
        name: "yellow",
        score: 0,
      });
      const red = await Team.create({
        students: [],
        color: "#F56043",
        name: "red",
        score: 0,
      });
      const green = await Team.create({
        students: [],
        color: "#3DC990",
        name: "green",
        score: 0,
      });
      const currentGame = await Game.create({
        gameCode: currentCode,
        roster: [],
        teams: [blue,yellow,red,green],
        queries: [],
      });
      await currentGame.save();
      console.log("currentgame", currentGame, "currentcode", currentCode);
      const user = new Teacher({
        email,
        firstName,
        lastName,
        schoolName,
        password,
        currentGame,
      });
      console.log(email);
      user.save((err, data) => {
        if (err) {
          const error = new ErrorResponse(
            "Error in database saving user.",
            401
          );
          return next(error);
        } else if (data) {
          console.log("creating user");
          data.password = undefined;
          let token = accessToken(data.id);
          return res.json({
            user: data,
            token: token,
          });
        }
      });
    }
  } catch (err) {
    return next(err);
  }
};

/* @desc: logInController takes a request and validates email and password.
 * As well, determines if user already exists via email and if one does exists
 * the retrieved user document's password is compared to the request's password.
 * If the passwords match the response object is modified with a JSON object that contains
 * a JWT and the retrieved user document without a password.
 * @param: req, res, next
 * @returns: none
 */
const logInController = async (req, res, next) => {
  const err = validationResult(req).formatWith(errorFormater);
  if (!err.isEmpty()) {
    const error = new ErrorResponse(err.array(), 401);
    return next(error);
  }

  const { email, password } = req.body;
  try {
    const user = await Teacher.findOne({
      email,
    });
    if (!user) {
      const error = new ErrorResponse("Teacher does not exist.", 401);
      return next(error);
    }
    user.comparePassword(password, function (err, isMatch) {
      if (err) {
        const error = new ErrorResponse("Unable to compare password.", 500);
        return next(error);
      } else if (isMatch) {
        let token = accessToken(user.id);
        user.password = undefined;
        res.json({
          user,
          token,
        });
      } else {
        const error = new ErrorResponse("Incorrect password.", 403);
        return next(error);
      }
    });
  } catch (err) {
    return next(err);
  }
};

export { logInController, registerController };
