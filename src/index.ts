import { GatewayIntentBits, Partials } from 'discord.js';
import { env } from '@/env';
import { Vaneta } from '@/structures/client';

const client = new Vaneta({
	intents: Object.values(GatewayIntentBits) as GatewayIntentBits[],
	partials: Object.values(Partials) as Partials[],
});

client.loadCommands('src/app/commands');
client.loadContexts('src/app/contexts');
client.loadEvents('src/app/events');

client.init(env.DISCORD_BOT_TOKEN);
