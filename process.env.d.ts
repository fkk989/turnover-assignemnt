export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: string;
      DATABASE_URL: string;
      JWT_SECRET: string;
      RESEND_API_KEY: string;
      SALT: string;
    }
  }
}
