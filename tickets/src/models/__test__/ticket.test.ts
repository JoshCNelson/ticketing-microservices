import { Ticket } from '../ticket';

it('implements optimistic concurrency control', async (done) => {
  // create an instance of a tickt
  const ticket = Ticket.build({
    title: 'one',
    price: 29,
    userId: 'asdf'
  });

  // save the ticket to the database
  await ticket.save();

  // fetch the ticket twice
  const firstInstance = await Ticket.findById(ticket.id);
  const secondInstance = await Ticket.findById(ticket.id);

  // make two seperate changes to the tix we fetch
  firstInstance!.set({ price: 10 });
  secondInstance!.set({ price: 15 });

  // save first fetched ticket
  await firstInstance!.save();

  // save the second fetched ticket and expect an error
  try {
    await secondInstance!.save();

  } catch (err) {
    return done();
  }

  // NOTE: workaround because a Jest matcher does not play
  // well w/ TS

  // this is a little janky but basically if our
  // verisioning is working correctly the secondInstance
  // will throw an error on save because the first instance
  // saved first and now the second is off-version.
  // This means we should expect to enter the catch of the
  // try/catch and just return (becaue we expect to hit an err)
  throw new Error('should not reach this point');
});

it('increments the version number on multiple saves', async () => {
  const ticket = Ticket.build({
    title: 'save me',
    price: 20,
    userId: 'aasdf'
  });

  await ticket.save();
  expect(ticket.version).toEqual(0);

  await ticket.save();
  expect(ticket.version).toEqual(1);

  await ticket.save();
  expect(ticket.version).toEqual(2);
});