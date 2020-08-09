import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const connectDB = () => {
  console.log(process.env.DATABASE_URL);
  return mongoose.connect(process.env.DATABASE_URL);
};

export { connectDB };
