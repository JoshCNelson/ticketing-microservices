import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';

import { Password } from '../services/password';
import { User } from '../models/user';
import { validateRequest, BadRequestError } from '@jntickets/common';

const router = express.Router();

router.post('/api/users/signin',
  [
    body('email')
      .isEmail()
      .withMessage('Email must be valid'),
    body('password')
      .trim()
      .notEmpty()
      .withMessage('You must supply a password')
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });

    if (!existingUser) { throw new BadRequestError('Invalid credentials'); }

    const passwordsMatch = await Password.compare(existingUser.password, password);

    if (!passwordsMatch) { throw new BadRequestError('Invalid credentials'); }

    // Generate JWT
    const existingUserJwt = jwt.sign({
      id: existingUser.id,
      email: existingUser.email
      // NOTE: adding ! tells TS we are overriding its concern that
      // the env var is undefined. We checked for null at boot in index.ts
    }, process.env.JWT_KEY!);

    // store on session object
    req.session = { jwt: existingUserJwt };


    res.status(200).send(existingUser);
  });

export { router as signinRouter };