import {
	drizzle as drizzlePg,
	type NodePgDatabase,
} from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import { env } from '@/env';
import Logger from '@/structures/logger';
import * as serverSchema from './schema/server';
import * as pgSchema from './schema/user';

const schema = { ...pgSchema, ...serverSchema };

const logger = new Logger();

export type DatabaseContext = {
	kind: 'postgres';
	db: NodePgDatabase<typeof schema>;
	schema: typeof schema;
	pool: Pool;
};

let connectionPromise: Promise<DatabaseContext> | null = null;

async function createDatabase(): Promise<DatabaseContext> {
	if (!env.DATABASE_URL) {
		throw new Error(
			'DATABASE_URL must be set before initialising the database',
		);
	}

	logger.info('Initialising Postgres database connection');
	const pool = new Pool({
		connectionString: env.DATABASE_URL,
		max: env.DATABASE_MAX_CONNECTIONS,
		idleTimeoutMillis: env.DATABASE_IDLE_TIMEOUT,
	});

	pool.on('error', (error) => {
		logger.warn(`Database pool error: ${error.message}`);
	});

	return {
		kind: 'postgres',
		db: drizzlePg(pool, { schema }),
		schema,
		pool,
	};
}
export async function initDatabase(): Promise<DatabaseContext> {
	if (!connectionPromise) {
		connectionPromise = createDatabase().catch((error) => {
			connectionPromise = null;
			throw error;
		});
	}

	return connectionPromise;
}
export async function closeDatabase(): Promise<void> {
	if (!connectionPromise) return;

	const connection = await connectionPromise;
	await connection.pool.end();

	connectionPromise = null;
}
