import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

export const env = createEnv({
	runtimeEnv: process.env,
	server: {
		DISCORD_BOT_TOKEN: z.string(),
		DEVELOPER_GUILD_ID: z.string(),
		DEVELOPER_USER_ID: z.string(),
	},
});
