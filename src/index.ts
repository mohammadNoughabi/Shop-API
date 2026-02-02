// import packeges 
import express from "express";

// import types
import type { Application } from "express";

// import other modules
import connectDb from "./config/dbConnection.ts";
import router from "./router.ts";

// initializing express app
const app: Application = express();

// middlewares
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use("/api" , router)

// main function to scheduling db connection before running app
const main = async () => {
  try {
    await connectDb();
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`Listening on port ${port}`);
    });
  } catch (error) {
    console.error("Critical failure:", error);
    process.exit(1);
  }
};

main();
