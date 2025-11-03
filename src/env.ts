import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

export const env = createEnv({
	runtimeEnv: process.env,
	server: {
		DISCORD_BOT_TOKEN: z.string(),
		DEVELOPER_GUILD_ID: z.string(),
		DEVELOPER_USER_ID: z.string(),
		DATABASE_URL: z.string().url(),
		DATABASE_MAX_CONNECTIONS: z.coerce.number().min(1).max(20).default(5),
		DATABASE_IDLE_TIMEOUT: z.coerce
			.number()
			.min(1000)
			.max(60000)
			.default(10000),
	},
});
