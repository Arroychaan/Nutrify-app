import 'dotenv/config';

export const config = {
  // Server
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',

  // Database
  database: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/nutrify',
    shadowUrl: process.env.DATABASE_SHADOW_URL,
  },

  // Redis
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-key',
    expiresIn: process.env.JWT_EXPIRE_TIME || '24h',
    refreshSecret: process.env.REFRESH_TOKEN_SECRET || 'dev-refresh-secret',
    refreshExpiresIn: process.env.REFRESH_TOKEN_EXPIRE_TIME || '7d',
  },

  // Gemini AI LLM
  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
    model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
  },

  // CORS
  cors: {
    allowedOrigins: (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(','),
  },

  // AWS
  aws: {
    s3Bucket: process.env.AWS_S3_BUCKET,
    region: process.env.AWS_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },

  // Features
  features: {
    gamification: process.env.ENABLE_GAMIFICATION === 'true',
    offlineMode: process.env.ENABLE_OFFLINE_MODE === 'true',
    biomarkerTracking: process.env.ENABLE_BIOMARKER_TRACKING !== 'false',
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'json',
  },
};

// Validate critical configs
if (!config.gemini.apiKey && config.isProduction) {
  throw new Error('GEMINI_API_KEY is required in production');
}

if (!config.jwt.secret && config.isProduction) {
  throw new Error('JWT_SECRET is required in production');
}

export default config;
