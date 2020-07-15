import User from "../models/User.js";
import jsonwebtoken from "jsonwebtoken";
const { verify } = jsonwebtoken;
import { ErrorResponse } from "../util/errorResponse.js";

const isAuth = async (req, res, next) => {
  console.log("got an authorization request");
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      const token = req.headers.authorization.split(" ")[1];
      const decoded = verify(token, process.env.ACCESS_TOKEN_SECRET);

      const user = await User.findById(decoded.id);
      user.password = undefined;

      req.user = user;
      next();
    } catch (error) {
      return next(new ErrorResponse(error.message, 401));
    }
  } else {
    return next(new ErrorResponse("Authentication Failed.", 401));
  }
};

export { isAuth };
