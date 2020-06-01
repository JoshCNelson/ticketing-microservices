import express from 'express';
import { currentUser } from '@jntickets/common';

const router = express.Router();

router.get('/api/users/currentuser', currentUser, (req, res) => {
  // This currentUser property is the JWT payload.
  // Setting this on the reqest is done in the imported currentUser middelware
  res.send({ currentUser: req.currentUser || null });
});

export { router as currentUserRouter };