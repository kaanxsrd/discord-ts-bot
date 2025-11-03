import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const servers = pgTable('servers', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	iconURL: text('icon_url'),
	bannerURL: text('banner_url'),
	locale: text('locale'),
	createdAt: timestamp('created_at', { withTimezone: true })
		.defaultNow()
		.notNull(),
});

export const logs = pgTable('logs', {
	id: text('id').primaryKey(),
	serverId: text('server_id')
		.notNull()
		.references(() => servers.id, { onDelete: 'cascade' }),

	messages: text('messages'),
	roles: text('roles'),
	join: text('join'),
	leaves: text('leaves'),
	voice: text('voice'),
	createdAt: timestamp('created_at', { withTimezone: true })
		.defaultNow()
		.notNull(),
});
