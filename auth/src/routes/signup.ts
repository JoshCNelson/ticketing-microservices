import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';

import { validateRequest, BadRequestError } from '@jntickets/common';
import { User } from '../models/user';

const router = express.Router();

router.post('/api/users/signup', [
  body('email')
    .isEmail()
    .withMessage('Email must be valid'),
  body('password')
    .trim()
    .isLength({ min: 4, max: 20 })
    .withMessage('Password must be between 4 and 20 characters')
],
  validateRequest, // run this before the next function to do validations
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) { throw new BadRequestError('Email in use'); }

    const user = User.build({ email, password })
    await user.save();

    // Generate JWT
    const userJwt = jwt.sign({
      id: user.id,
      email: user.email
      // NOTE: adding ! tells TS we are overriding its concern that
      // the env var is undefined. We checked for null at boot in index.ts
    }, process.env.JWT_KEY!);

    // store on session object
    req.session = { jwt: userJwt };


    res.status(201).send(user);
  });

export { router as signupRouter };