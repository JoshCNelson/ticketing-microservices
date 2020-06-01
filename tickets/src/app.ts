// This file was split from index.ts to allow us to use
// supertest so taht we can listen on an ephemeral port
// and not be tied to a specific port as we want to be in
// dev or prod
import express from 'express';
import 'express-async-errors'; // changes how express deals with async errors
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import { errorHandler, NotFoundError, currentUser } from '@jntickets/common';
import { createTicketRouter } from './routes/new';
import { showTicketRouter } from './routes/show';
import { indexTicketRouter } from './routes/index';
import { updateTicketRouter } from './routes/update';

const app = express();

// lets express know that it is behind an nginx proxy and that
// the proxy is ok
app.set('trust proxy', true);

app.use(json());
app.use(cookieSession({
  signed: false,
  secure: process.env.NODE_ENV !== 'test',
}));

app.use(currentUser);

app.use(createTicketRouter);
app.use(showTicketRouter);
app.use(indexTicketRouter);
app.use(updateTicketRouter);

// this needs to come before the errorhander, any route that does not
// exist will throw this error instead
app.all('*', async () => {
  // normally you cannot throw an error on an async request in express
  // the default is method is to use the next() function provided in the
  // callback but we can use the throw syntax if we import 'express-async-errors'
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };