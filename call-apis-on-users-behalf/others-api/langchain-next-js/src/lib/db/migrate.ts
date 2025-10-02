import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import dotenv from 'dotenv';

const runMigrate = async () => {
  dotenv.config({ path: '.env.local' });

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not defined');
  }

  const connection = postgres(process.env.DATABASE_URL, { max: 1 });

  const db = drizzle(connection);

  console.log('⏳ Running migrations...');

  const start = Date.now();

  await migrate(db, { migrationsFolder: 'src/lib/db/migrations' });

  const end = Date.now();

  console.log('✅ Migrations completed in', end - start, 'ms');

  process.exit(0);
};

runMigrate().catch((err) => {
  // Ignore errors for already existing constraints/tables/schemas
  const ignoreCodes = ['42710', '42P07', '42P06'];
  if (err.code && ignoreCodes.includes(err.code)) {
    console.log('⚠️  Migration skipped (already exists)');
    process.exit(0);
  }
  console.error('❌ Migration failed');
  console.error(err);
  process.exit(1);
});
