import { z } from "zod";

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),
  
  // Authentication
  NEXTAUTH_SECRET: z.string().min(1),
  NEXTAUTH_URL: z.string().url(),
  
  // OAuth Providers
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  
  // OpenAI
  OPENAI_API_KEY: z.string().min(1),
  
  // File Storage
  BLOB_READ_WRITE_TOKEN: z.string().min(1),
  
  // Email
  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z.string().min(1),
  SMTP_USER: z.string().min(1),
  SMTP_PASSWORD: z.string().min(1),
  SMTP_FROM: z.string().email(),
  
  // Node Environment
  NODE_ENV: z.enum(["development", "production", "test"]),
});

export const env = envSchema.parse(process.env);

// 型定義のエクスポート
export type Env = z.infer<typeof envSchema>; 