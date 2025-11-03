import { eq } from 'drizzle-orm';

import { initDatabase } from '@/infrastructure/database';
import Logger from '@/structures/logger';

type LogRow =
	typeof import('@/infrastructure/database/schema/server').logs.$inferSelect;
type LogInsert =
	typeof import('@/infrastructure/database/schema/server').logs.$inferInsert;

export interface LogUpsertInput {
	id: string;
	serverId: string;
	messages?: string | null;
	roles?: string | null;
	join?: string | null;
	leaves?: string | null;
	voice?: string | null;
}

export interface LogRecord {
	id: string;
	serverId: string;
	messages: string | null;
	roles: string | null;
	join: string | null;
	leaves: string | null;
	voice: string | null;
	createdAt: Date;
}

const logger = new Logger();

/**
 * Normalizes a database row to a LogRecord with consistent Date handling.
 */
function normalizeRow(row: LogRow): LogRecord {
	const createdAt =
		row.createdAt instanceof Date ? row.createdAt : new Date(row.createdAt);

	return {
		id: row.id,
		serverId: row.serverId,
		messages: row.messages ?? null,
		roles: row.roles ?? null,
		join: row.join ?? null,
		leaves: row.leaves ?? null,
		voice: row.voice ?? null,
		createdAt,
	};
}

/**
 * Builds a partial update payload, filtering out unchanged fields.
 */
function buildUpdatePayload(
	updates: Partial<Omit<LogUpsertInput, 'id' | 'serverId'>>,
): Partial<LogInsert> | null {
	const payload: Partial<LogInsert> = {};

	if (Object.hasOwn(updates, 'messages')) {
		payload.messages = updates.messages ?? null;
	}

	if (Object.hasOwn(updates, 'roles')) {
		payload.roles = updates.roles ?? null;
	}

	if (Object.hasOwn(updates, 'join')) {
		payload.join = updates.join ?? null;
	}

	if (Object.hasOwn(updates, 'leaves')) {
		payload.leaves = updates.leaves ?? null;
	}

	if (Object.hasOwn(updates, 'voice')) {
		payload.voice = updates.voice ?? null;
	}

	// Only return payload if there are actual updates
	return Object.keys(payload).length > 0 ? payload : null;
}

/**
 * Saves a log entry to the database using upsert (insert or update on conflict).
 */
export async function saveLog(input: LogUpsertInput): Promise<LogRecord> {
	const connection = await initDatabase();

	try {
		const values = {
			id: input.id,
			serverId: input.serverId,
			messages: input.messages ?? null,
			roles: input.roles ?? null,
			join: input.join ?? null,
			leaves: input.leaves ?? null,
			voice: input.voice ?? null,
		};

		const results = await connection.db
			.insert(connection.schema.logs)
			.values(values)
			.onConflictDoUpdate({
				target: connection.schema.logs.id,
				set: values,
			})
			.returning();

		const row = results[0];
		if (!row) {
			throw new Error(`Failed to retrieve saved log ${input.id}`);
		}

		return normalizeRow(row);
	} catch (error) {
		logger.error(
			`Failed to save log ${input.id}: ${
				error instanceof Error ? error.message : String(error)
			}`,
		);
		throw error;
	}
}

/**
 * Updates a log entry with partial fields. Returns null if no updates were provided.
 */
export async function updateLog(
	id: string,
	updates: Partial<Omit<LogUpsertInput, 'id' | 'serverId'>>,
): Promise<LogRecord | null> {
	const connection = await initDatabase();
	const payload = buildUpdatePayload(updates);

	if (!payload) {
		return null;
	}

	try {
		const results = await connection.db
			.update(connection.schema.logs)
			.set(payload)
			.where(eq(connection.schema.logs.id, id))
			.returning();

		const row = results[0];
		return row ? normalizeRow(row) : null;
	} catch (error) {
		logger.error(
			`Failed to update log ${id}: ${
				error instanceof Error ? error.message : String(error)
			}`,
		);
		throw error;
	}
}

/**
 * Retrieves a log entry by its ID. Returns null if not found or on error.
 */
export async function getLogById(id: string): Promise<LogRecord | null> {
	const connection = await initDatabase();

	try {
		const row = await connection.db.query.logs.findFirst({
			where: (logs, { eq: eqOp }) => eqOp(logs.id, id),
		});

		return row ? normalizeRow(row) : null;
	} catch (error) {
		logger.warn(
			`Failed to fetch log ${id}: ${
				error instanceof Error ? error.message : String(error)
			}`,
		);
		return null;
	}
}

/**
 * Retrieves all log entries for a specific server.
 */
export async function getLogsByServerId(
	serverId: string,
): Promise<LogRecord[]> {
	const connection = await initDatabase();

	try {
		const rows = await connection.db
			.select()
			.from(connection.schema.logs)
			.where(eq(connection.schema.logs.serverId, serverId));

		return rows.map(normalizeRow);
	} catch (error) {
		logger.warn(
			`Failed to fetch logs for server ${serverId}: ${
				error instanceof Error ? error.message : String(error)
			}`,
		);
		return [];
	}
}

/**
 * Deletes a log entry by its ID.
 */
export async function deleteLog(id: string): Promise<boolean> {
	const connection = await initDatabase();

	try {
		const result = await connection.db
			.delete(connection.schema.logs)
			.where(eq(connection.schema.logs.id, id));

		return result.rowCount ? result.rowCount > 0 : true;
	} catch (error) {
		logger.error(
			`Failed to delete log ${id}: ${
				error instanceof Error ? error.message : String(error)
			}`,
		);
		throw error;
	}
}
