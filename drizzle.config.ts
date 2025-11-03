import { defineConfig } from 'drizzle-kit';

const sharedConfig = {
	schema: './src/infrastructure/database/schema/**/*.ts',
	out: './src/infrastructure/database/migrations',
	breakpoints: true,
};

if (!process.env.DATABASE_URL) {
	throw new Error('DATABASE_URL must be set for Drizzle configuration');
}

export default defineConfig({
	...sharedConfig,
	dialect: 'postgresql',
	dbCredentials: {
		url: process.env.DATABASE_URL,
	},
});
