import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

export * from './schema';

// Singleton setup to prevent connection exhaustion in development
const globalForDb = globalThis as unknown as {
  dbClient: postgres.Sql<{}> | undefined;
};

export function createDbClient(connectionString: string) {
  let client = globalForDb.dbClient;
  
  if (!client) {
    client = postgres(connectionString, { prepare: false });
    if (process.env.NODE_ENV !== 'production') {
      globalForDb.dbClient = client;
    }
  }

  return drizzle(client, { schema });
}

export type DbClient = ReturnType<typeof createDbClient>;
