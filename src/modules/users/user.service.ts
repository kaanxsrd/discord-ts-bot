import { eq } from 'drizzle-orm';

import { initDatabase } from '@/infrastructure/database';
import Logger from '@/structures/logger';

type PostgresRow =
	typeof import('@/infrastructure/database/schema/postgres').users.$inferSelect;
type PostgresInsert =
	typeof import('@/infrastructure/database/schema/postgres').users.$inferInsert;
type UserRow = PostgresRow;
type UserInsert = PostgresInsert;

export interface UserUpsertInput {
	id: string;
	username: string;
	displayName?: string | null;
	avatar?: string | null;
	locale?: string | null;
}

export interface UserRecord {
	id: string;
	username: string;
	displayName: string | null;
	avatar: string | null;
	locale: string | null;
	createdAt: Date;
	updatedAt: Date;
}

const logger = new Logger();

function normalizeRow(row: UserRow): UserRecord {
	const createdAt =
		row.createdAt instanceof Date ? row.createdAt : new Date(row.createdAt);
	const updatedAt =
		row.updatedAt instanceof Date ? row.updatedAt : new Date(row.updatedAt);

	return {
		id: row.id,
		username: row.username,
		displayName: row.displayName ?? null,
		avatar: row.avatar ?? null,
		locale: row.locale ?? null,
		createdAt,
		updatedAt,
	};
}

function buildUpdatePayload(
	updates: Partial<Omit<UserUpsertInput, 'id'>>,
	now: Date,
): Partial<UserInsert> | null {
	const payload: Partial<UserInsert> = { updatedAt: now };

	if (updates.username !== undefined) {
		payload.username = updates.username;
	}

	if (Object.hasOwn(updates, 'displayName')) {
		payload.displayName = updates.displayName ?? null;
	}

	if (Object.hasOwn(updates, 'avatar')) {
		payload.avatar = updates.avatar ?? null;
	}

	if (Object.hasOwn(updates, 'locale')) {
		payload.locale = updates.locale ?? null;
	}

	return Object.keys(payload).length > 1 ? payload : null;
}

export async function saveUser(input: UserUpsertInput): Promise<UserRecord> {
	const connection = await initDatabase();
	const now = new Date();

	try {
		const values = {
			id: input.id,
			username: input.username,
			displayName: input.displayName ?? null,
			avatar: input.avatar ?? null,
			locale: input.locale ?? null,
			updatedAt: now,
		};

		const [row] = await connection.db
			.insert(connection.schema.users)
			.values(values)
			.onConflictDoUpdate({
				target: connection.schema.users.id,
				set: values,
			})
			.returning();

		if (!row) {
			throw new Error(`Failed to retrieve saved user ${input.id}`);
		}

		return normalizeRow(row);
	} catch (error) {
		logger.error(
			`Failed to save user ${input.id}: ${
				error instanceof Error ? error.message : String(error)
			}`,
		);
		throw error;
	}
}

export async function updateUser(
	id: string,
	updates: Partial<Omit<UserUpsertInput, 'id'>>,
): Promise<UserRecord | null> {
	const connection = await initDatabase();
	const now = new Date();
	const payload = buildUpdatePayload(updates, now);

	if (!payload) {
		return null;
	}

	try {
		const [row] = await connection.db
			.update(connection.schema.users)
			.set(payload)
			.where(eq(connection.schema.users.id, id))
			.returning();

		return row ? normalizeRow(row) : null;
	} catch (error) {
		logger.error(
			`Failed to update user ${id}: ${
				error instanceof Error ? error.message : String(error)
			}`,
		);
		throw error;
	}
}

export async function getUserById(id: string): Promise<UserRecord | null> {
	const connection = await initDatabase();

	try {
		const row = await connection.db.query.users.findFirst({
			where: (users, { eq: eqOp }) => eqOp(users.id, id),
		});

		return row ? normalizeRow(row) : null;
	} catch (error) {
		logger.warn(
			`Failed to fetch user ${id}: ${
				error instanceof Error ? error.message : String(error)
			}`,
		);
		return null;
	}
}
