// This file uses the base app configuration from app.ts
// and adds in connection logic for mongoose and the port
// we want the app to listen to in prod / dev. This was split
// so that the base app config could be use supertest for
// testing requests
import { natsWrapper } from './nats-wrapper';
import { OrderCreatedListener } from './events/listeners/order-created-listener';

const start = async () => {
  // Adding this check for JWT_KEY at boot to detect early
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

    new OrderCreatedListener(natsWrapper.client).listen();

  } catch (err) {
    console.log(err);
  }
}

start();
