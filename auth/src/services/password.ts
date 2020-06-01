import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

// scryp is callback based, we want it to be
// compatible with asyc/await and promisfy
// allows us to turn callbacks into promises
// therefore allowing us to use async/await
const scryptAsync = promisify(scrypt);

export class Password {
  static async toHash(password: string) {
    const salt = randomBytes(8).toString('hex');
    // wrapping it as Buffer tells ts what buf is
    const buf = (await scryptAsync(password, salt, 64)) as Buffer;

    return `${buf.toString('hex')}.${salt}`;
  }

  static async compare(storedPassword: string, suppliedPassword: string) {
    const [hashedPassword, salt] = storedPassword.split('.');
    const buf = (await scryptAsync(suppliedPassword, salt, 64)) as Buffer;

    return buf.toString('hex') === hashedPassword;
  }
}