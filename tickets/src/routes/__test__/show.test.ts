import mongoose, { mongo } from 'mongoose';
import request from 'supertest';
import { app } from '../../app';

it('returns a 404 if the ticket is not found', async () => {
  const id = mongoose.Types.ObjectId().toHexString();
  await request(app)
    .get(`/api/tickets/${id}`)
    .send({})
    .expect(404);
});

it('returns a ticket if the ticket not found', async () => {
  const ticketTitle = 'a ticket';
  const ticketPrice = 20;

  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({ title: ticketTitle, price: ticketPrice })
    .expect(201)

  const ticketResponse = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send()
    .expect(200);

  expect(ticketResponse.body.title).toEqual(ticketTitle);
  expect(ticketResponse.body.price).toEqual(ticketPrice);
});