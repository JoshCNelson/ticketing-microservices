import express, { Request, Response } from 'express';
import { requireAuth } from '@jntickets/common';
import { body } from 'express-validator';
import { Order } from '../models/order';

const router = express.Router();

router.get('/api/orders', requireAuth, async (req: Request, res: Response) => {
  const orders = await Order
    .find({ userId: req.currentUser!.id })
    // this gives us refs in each order to its
    // associated ticket
    .populate('ticket');

  res.send(orders);
});

export { router as indexOrderRouter };