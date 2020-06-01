import { Message, Stan } from 'node-nats-streaming';
import { Subjects } from './subjects';


interface Event {
  subject: Subjects;
  data: any;
}

export abstract class Listener<T extends Event> {
  abstract subject: T['subject'];
  abstract queueGroupName: string;
  abstract onMessage(data: T['data'], msg: Message): void;

  private client: Stan;

  protected ackWait = 5 * 1000; // 5 seconds

  constructor(client: Stan) {
    this.client = client;
  }

  subscriptionOptions() {
    return this.client
      .subscriptionOptions()
      .setDeliverAllAvailable()
      .setManualAckMode(true)
      .setAckWait(this.ackWait)
      .setDurableName(this.queueGroupName)
  }

  listen() {
    const subscription = this.client.subscribe(
      this.subject,
      this.queueGroupName,
      this.subscriptionOptions()
    )

    subscription.on('message', (msg: Message) => {
      console.log(`message recieved: ${this.subject} / ${this.queueGroupName}`)

      const parsedData = this.parseMessage(msg);
      this.onMessage(parsedData, msg);
    });
  }

  parseMessage(msg: Message) {
    const data = msg.getData();
    // we don't expect to ever get a Buffer but in the event we do the second expression
    // is how we would parse it
    return typeof data === 'string' ? JSON.parse(data) : JSON.parse(data.toString('utf8'))

  }
}