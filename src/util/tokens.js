import jsonwebtoken from "jsonwebtoken";
const { sign } = jsonwebtoken;
const accessToken = (userID) => {
  return sign({ id: userID }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "12h",
  });
};

export { accessToken };
