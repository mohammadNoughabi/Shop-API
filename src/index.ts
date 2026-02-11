import app from './app.ts';
import mongoConnection from './config/dbConnection.ts';

const main = async () => {
  try {
    await mongoConnection.connect();

    const port = process.env.PORT || 3000;

    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  } catch (error) {
    console.error('Critical failure during startup:', error);
    process.exit(1);
  }
};

void main();
