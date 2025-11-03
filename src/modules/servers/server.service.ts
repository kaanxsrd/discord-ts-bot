import { eq } from 'drizzle-orm';

import { initDatabase } from '@/infrastructure/database';
import Logger from '@/structures/logger';

type ServerRow =
	typeof import('@/infrastructure/database/schema/server').servers.$inferSelect;
type ServerInsert =
	typeof import('@/infrastructure/database/schema/server').servers.$inferInsert;

export interface ServerUpsertInput {
	id: string;
	name: string;
	iconURL?: string | null;
	bannerURL?: string | null;
	locale?: string | null;
}

export interface ServerRecord {
	id: string;
	name: string;
	iconURL: string | null;
	bannerURL: string | null;
	locale: string | null;
	createdAt: Date;
}

const logger = new Logger();

function normalizeRow(row: ServerRow): ServerRecord {
	const createdAt =
		row.createdAt instanceof Date ? row.createdAt : new Date(row.createdAt);

	return {
		id: row.id,
		name: row.name,
		iconURL: row.iconURL ?? null,
		bannerURL: row.bannerURL ?? null,
		locale: row.locale ?? null,
		createdAt,
	};
}

function buildUpdatePayload(
	updates: Partial<Omit<ServerUpsertInput, 'id'>>,
): Partial<ServerInsert> | null {
	const payload: Partial<ServerInsert> = {};

	if (updates.name !== undefined) {
		payload.name = updates.name;
	}

	if (Object.hasOwn(updates, 'iconURL')) {
		payload.iconURL = updates.iconURL ?? null;
	}

	if (Object.hasOwn(updates, 'bannerURL')) {
		payload.bannerURL = updates.bannerURL ?? null;
	}

	if (Object.hasOwn(updates, 'locale')) {
		payload.locale = updates.locale ?? null;
	}

	return Object.keys(payload).length > 0 ? payload : null;
}

export async function saveServer(
	input: ServerUpsertInput,
): Promise<ServerRecord> {
	const connection = await initDatabase();

	try {
		const values = {
			id: input.id,
			name: input.name,
			iconURL: input.iconURL ?? null,
			bannerURL: input.bannerURL ?? null,
			locale: input.locale ?? null,
		};

		const results = await connection.db
			.insert(connection.schema.servers)
			.values(values)
			.onConflictDoUpdate({
				target: connection.schema.servers.id,
				set: values,
			})
			.returning();

		const row = results[0];
		if (!row) {
			throw new Error(`Failed to retrieve saved server ${input.id}`);
		}

		return normalizeRow(row);
	} catch (error) {
		logger.error(
			`Failed to save server ${input.id}: ${
				error instanceof Error ? error.message : String(error)
			}`,
		);
		throw error;
	}
}

export async function updateServer(
	id: string,
	updates: Partial<Omit<ServerUpsertInput, 'id'>>,
): Promise<ServerRecord | null> {
	const connection = await initDatabase();
	const payload = buildUpdatePayload(updates);

	if (!payload) {
		return null;
	}

	try {
		const results = await connection.db
			.update(connection.schema.servers)
			.set(payload)
			.where(eq(connection.schema.servers.id, id))
			.returning();

		const row = results[0];
		return row ? normalizeRow(row) : null;
	} catch (error) {
		logger.error(
			`Failed to update server ${id}: ${
				error instanceof Error ? error.message : String(error)
			}`,
		);
		throw error;
	}
}

export async function getServerById(id: string): Promise<ServerRecord | null> {
	const connection = await initDatabase();

	try {
		const row = await connection.db.query.servers.findFirst({
			where: (servers, { eq: eqOp }) => eqOp(servers.id, id),
		});

		return row ? normalizeRow(row) : null;
	} catch (error) {
		logger.warn(
			`Failed to fetch server ${id}: ${
				error instanceof Error ? error.message : String(error)
			}`,
		);
		return null;
	}
}

export async function deleteServer(id: string): Promise<boolean> {
	const connection = await initDatabase();

	try {
		const result = await connection.db
			.delete(connection.schema.servers)
			.where(eq(connection.schema.servers.id, id));

		return result.rowCount ? result.rowCount > 0 : true;
	} catch (error) {
		logger.error(
			`Failed to delete server ${id}: ${
				error instanceof Error ? error.message : String(error)
			}`,
		);
		throw error;
	}
}
