import { config } from 'dotenv';
import { z } from 'zod';

// Load environment variables
config();

// Environment schema validation
const envSchema = z.object({
  // Application
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3001'),

  // Database
  DATABASE_URL: z.string().url(),

  // JWT
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('7d'),

  // Bcrypt
  BCRYPT_ROUNDS: z.string().transform(Number).default('10'),

  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:3000,http://localhost:5173'),

  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});

// Validate and parse environment variables
const env = envSchema.parse(process.env);

export const environment = {
  nodeEnv: env.NODE_ENV,
  port: env.PORT,
  isDevelopment: env.NODE_ENV === 'development',
  isProduction: env.NODE_ENV === 'production',
  isTest: env.NODE_ENV === 'test',

  database: {
    url: env.DATABASE_URL,
  },

  jwt: {
    secret: env.JWT_SECRET,
    expiresIn: env.JWT_EXPIRES_IN,
  },

  bcrypt: {
    rounds: env.BCRYPT_ROUNDS,
  },

  cors: {
    origins: env.CORS_ORIGIN.split(',').map(origin => origin.trim()),
  },

  logging: {
    level: env.LOG_LEVEL,
  },
} as const;

export type Environment = typeof environment;
