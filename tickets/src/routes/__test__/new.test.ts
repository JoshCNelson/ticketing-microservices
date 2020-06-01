import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
// we import the path to the real natsWrapper
// but in our testSetup.ts` jest will swap it out
// with the one defined under __mocks__
import { natsWrapper } from '../../nats-wrapper';

it('has a route handler listening to api/tickets for post requests', async () => {
  const response = await request(app)
    .post('/api/tickets')
    .send({});

  expect(response.status).not.toEqual(404);
});

it('can only be accessed if the user is signed in', async () => {
  await request(app)
    .post('/api/tickets')
    .send({})
    .expect(401);
});

it('returns a status other than 401 if the user is signed in', async () => {
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({})

  expect(response.status).not.toEqual(401);
});

it('returns an error if an invalid title is provided', async () => {
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({ title: '', price: 10 })
    .expect(400)

  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({ price: 10 })
    .expect(400)
});

it('returns an error if an invalid price is provided', async () => {
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({ title: 'valid title', price: -10 })
    .expect(400)

  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({ title: 'valid title' })
    .expect(400)
});

it('creates a ticket with valid inputs', async () => {
  const ticketTitle = 'a title';
  const ticketPrice = 20;
  // add in a check to make sure a ticket was saved
  let tickets = await Ticket.find({});

  expect(tickets.length).toEqual(0);

  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title: ticketTitle,
      price: ticketPrice
    })
    .expect(201)

  tickets = await Ticket.find({});
  expect(tickets.length).toEqual(1);
  expect(tickets[0].price).toEqual(ticketPrice);
  expect(tickets[0].title).toEqual(ticketTitle);
});

it('publishes an event', async () => {
  const ticketTitle = 'title';

  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title: ticketTitle,
      price: 20
    })
    .expect(201)

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});