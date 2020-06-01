// This file uses the base app configuration from app.ts
// and adds in connection logic for mongoose and the port
// we want the app to listen to in prod / dev. This was split
// so that the base app config could be use supertest for
// testing requests
import { app } from './app';
import mongoose from 'mongoose';
import { natsWrapper } from './nats-wrapper';
import { TicketCreatedListener } from './events/listeners/ticket-created-listener';
import { TicketUpdatedListener } from './events/listeners/ticket-updated-listener';
import { ExpirationCompleteListener } from './events/listeners/expiration-complete-listener';
import { PaymentCreatedListener } from './events/listeners/payment-created-listener';

const start = async () => {
  // Adding this check for JWT_KEY at boot to detect early
  if (!process.env.JWT_KEY) { throw new Error('JWT_KEY must be defined'); }
  if (!process.env.MONGO_URI) { throw new Error('MONGO_URI must be defined'); }
  if (!process.env.NATS_CLIENT_ID) { throw new Error('NATS_CLIENT_ID must be defined'); }
  if (!process.env.NATS_CLUSTER_ID) { throw new Error('NATS_CLUSTER_ID must be defined'); }
  if (!process.env.NATS_URL) { throw new Error('NATS_URL be defined'); }

  try {
    await natsWrapper.connect(
      process.env.NATS_CLUSTER_ID,
      process.env.NATS_CLIENT_ID,
      process.env.NATS_URL
    );

    natsWrapper.client.on('close', () => {
      console.log('NATS connection closed');
      process.exit();
    });
    process.on('SIGINT', () => natsWrapper.client.close());
    process.on('SIGTERM', () => natsWrapper.client.close());

    new TicketCreatedListener(natsWrapper.client).listen();
    new TicketUpdatedListener(natsWrapper.client).listen();
    new ExpirationCompleteListener(natsWrapper.client).listen();
    new PaymentCreatedListener(natsWrapper.client).listen();

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
