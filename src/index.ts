// import packeges
import express from 'express';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import rateLimit from 'express-rate-limit';

// import types
import type { Application } from 'express';

// import other modules
import connectDb from './config/dbConnection.ts';
import router from './router.ts';

// initializing express app
const app: Application = express();
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
});

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET as string,
    resave: false,
    saveUninitialized: true,
  }),
);
app.use(limiter);

// routes
app.use('/api', router);

// main function to scheduling db connection before running app
const main = async () => {
  try {
    await connectDb();
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`Listening on port ${port}`);
    });
  } catch (error) {
    console.error('Critical failure:', error);
    process.exit(1);
  }
};

void main();
