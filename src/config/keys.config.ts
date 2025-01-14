import { config } from 'dotenv';
config();

export const keys = {
  JWT_SECRET: process.env.JWT_SECRET || 'secret',
  PORT: process.env.PORT || 3000,
};
