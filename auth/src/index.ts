// This file uses the base app configuration from app.ts
// and adds in connection logic for mongoose and the port
// we want the app to listen to in prod / dev. This was split
// so that the base app config could be use supertest for
// testing requests
import { app } from './app';
import mongoose from 'mongoose';

const start = async () => {
  // Adding this check for JWT_KEY at boot to detect early
  if (!process.env.JWT_KEY) { throw new Error('JWT_KEY must be defined'); }
  if (!process.env.MONGO_URI) { throw new Error('MONGO_URI must be defined'); }

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true
    });

    console.log('Connected to MongoDB');

  } catch (err) {
    console.log(err);
  }

  app.listen('3000', () => {
    console.log('listening on port 3000 :)');
  });
}

start();
