import nats, { Stan } from 'node-nats-streaming';

class NatsWrapper {
  private _client?: Stan;

  get client() {
    // this getter is a wrapper to throw an error in the event
    // someone tries to access nats before they have connected it
    if (!this._client) { throw new Error('Cannot access Nats client before connecting') }

    return this._client;
  }

  connect(clusterId: string, clientId: string, url: string) {
    this._client = nats.connect(clusterId, clientId, { url });

    // turning this inot a promise so we can use async/await
    // harder to work with straight callbacks
    return new Promise((resolve, reject) => {
      this.client.on('connect', () => {
        console.log('Connected to Nats');
        resolve();
      });

      this.client.on('error', (err) => {
        reject(err);
      });
    });
  }

}

export const natsWrapper = new NatsWrapper();