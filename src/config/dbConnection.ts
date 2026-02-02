import mongoose from "mongoose";

const connectDb = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("MONGO_URI is missing");

  // Prevent duplicate connections
  if (mongoose.connection.readyState === 1) {
    console.log("Using existing MongoDB connection");
    return;
  }

  if (mongoose.connection.readyState === 2) {
    console.log("Already connecting to MongoDB...");
    return;
  }

  try {
    await mongoose.connect(uri);

    console.log(`MongoDB Connected: ${mongoose.connection.host}`);

    // Optional: Add event listeners once
    mongoose.connection.on("disconnected", () =>
      console.log("MongoDB disconnected"),
    );

    mongoose.connection.on("error", (err) =>
      console.error("MongoDB error:", err),
    );
  } catch (error: any) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

export default connectDb;
