import mongoose from "mongoose";
import "dotenv/config";

const mongoUri =
  process.env.MONGODB_URI || "mongodb://fastapi:fastapi_password@localhost:27017/fastapi?authSource=admin";

export const connectDatabase = async () => {
  await mongoose.connect(mongoUri);
};
