import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import Teacher from "./teacher.js";

const connectDB = () => {
  console.log(process.env.DATABASE_URL);
  return mongoose.connect(process.env.DATABASE_URL);
};

const models = { Teacher };

export { connectDB };
export default models;
