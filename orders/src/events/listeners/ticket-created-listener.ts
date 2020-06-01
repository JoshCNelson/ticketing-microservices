import { Message } from 'node-nats-streaming';
import { Listener, Subjects, TicketCreatedEvent } from '@jntickets/common';
import { Ticket } from '../../models/ticket';
import { queueGroupName } from './queue-group-name';

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: TicketCreatedEvent['data'], msg: Message) {
    const { id, title, price } = data;
    const ticket = await Ticket
      .build({ id, title, price });
    await ticket.save();

    // tells nats the data was recieved and processed successfully
    // nats will now not try to re-process the event
    msg.ack();
  }
}