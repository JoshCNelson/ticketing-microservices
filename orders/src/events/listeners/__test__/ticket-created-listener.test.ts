import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { TicketCreatedEvent } from '@jntickets/common';
import { TicketCreatedListener } from '../../listeners/ticket-created-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Ticket } from '../../../models/ticket';

const setup = async () => {
  // create an instance of the listener
  const listener = new TicketCreatedListener(natsWrapper.client);

  //create a fake data event
  const data: TicketCreatedEvent['data'] = {
    version: 0,
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'le title',
    price: 10,
    userId: mongoose.Types.ObjectId().toHexString(),
  }

  // create a fake message obj
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  }

  return { listener, data, msg };
}

it('creates and saves a ticket', async () => {
  // call the onMessage w/ the data and message obj
  const { listener, data, msg } = await setup();
  await listener.onMessage(data, msg);

  // write assert to make sure ticket was creatd
  const ticket = await Ticket.findById(data.id);

  expect(ticket).toBeDefined();
  expect(ticket!.title).toEqual(data.title);
  expect(ticket!.price).toEqual(data.price);
});

it('acks the message', async () => {
  // call the onMessage w/ the data and message obj
  const { data, listener, msg } = await setup();
  await listener.onMessage(data, msg);

  // write asserttions to make sure ack was called
  expect(msg.ack).toHaveBeenCalled();
});