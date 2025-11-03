import { GatewayIntentBits, Partials } from 'discord.js';
import { env } from '@/env';
import { closeDatabase, initDatabase } from '@/infrastructure/database';
import { Vaneta } from '@/structures/client';

const client = new Vaneta({
	intents: Object.values(GatewayIntentBits) as GatewayIntentBits[],
	partials: Object.values(Partials) as Partials[],
});

try {
	await initDatabase();
	client.logger.success('Database connection established');
} catch (error) {
	client.logger.error(
		`Failed to initialise database: ${
			error instanceof Error ? error.message : String(error)
		}`,
	);
	await closeDatabase();
	process.exit(1);
}

client.loadCommands('src/app/commands');
client.loadContexts('src/app/contexts');
client.loadEvents('src/app/events');

try {
	await client.init(env.DISCORD_BOT_TOKEN);
} catch (_error) {
	await closeDatabase();
	process.exit(1);
}
