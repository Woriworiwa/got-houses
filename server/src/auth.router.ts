import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { userStore } from './user.store.js';
import { LoginBody, PublicUser, RegisterBody } from './models.js';

export const authRouter = Router();

const JWT_SECRET = 'dev-secret-change-in-prod';
const SALT_ROUNDS = 10;
const TOKEN_TTL = '8h';

function toPublicUser({ id, email, name }: { id: string; email: string; name: string }): PublicUser {
  return { id, email, name };
}

// POST /auth/register
authRouter.post('/register', async (req: Request<object, object, RegisterBody>, res: Response) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    res.status(400).json({ message: 'email, password and name are required' });
    return;
  }

  if (userStore.findByEmail(email)) {
    res.status(409).json({ message: 'Email already in use' });
    return;
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = { id: randomUUID(), email, name, passwordHash, createdAt: new Date() };
  userStore.save(user);

  const token = jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: TOKEN_TTL });
  res.status(201).json({ token, user: toPublicUser(user) });
});

// POST /auth/login
authRouter.post('/login', async (req: Request<object, object, LoginBody>, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: 'email and password are required' });
    return;
  }

  const user = userStore.findByEmail(email);
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    res.status(401).json({ message: 'Invalid credentials' });
    return;
  }

  const token = jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: TOKEN_TTL });
  res.json({ token, user: toPublicUser(user) });
});

// GET /auth/me  — requires Bearer token
authRouter.get('/me', requireAuth, (req: Request, res: Response) => {
  const user = userStore.findById(res.locals['userId'] as string);
  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }
  res.json({ user: toPublicUser(user) });
});

// Middleware
function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Missing or invalid Authorization header' });
    return;
  }

  try {
    const payload = jwt.verify(header.slice(7), JWT_SECRET) as jwt.JwtPayload;
    res.locals['userId'] = payload['sub'];
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
}
