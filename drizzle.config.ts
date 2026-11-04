import { defineConfig } from 'drizzle-kit';

// `driver: 'expo'` is what Drizzle uses to bundle migrations for on-device SQLite
// (it also applies to op-sqlite). Run: yarn db:generate
export default defineConfig({
  dialect: 'sqlite',
  driver: 'expo',
  schema: './src/db/schema/index.ts',
  out: './src/db/migrations',
});
