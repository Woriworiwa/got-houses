import express from 'express';
import cors from 'cors';
import { authRouter } from './auth.router.js';

export const app = express();

app.use(cors({ origin: 'http://localhost:4200' }));
app.use(express.json());
app.use('/auth', authRouter);
