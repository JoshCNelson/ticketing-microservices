export const stripe = {
  charges: {
    create: jest.fn().mockResolvedValue({ id: 'alskjf' }) // return the id so the test doesn't fail on saving Payment
  }
}