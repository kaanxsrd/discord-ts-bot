import { GatewayIntentBits, Partials } from 'discord.js';
import { env } from '@/env';
import { Vaneta } from '@/structures/client';

const client = new Vaneta({
	intents: Object.values(GatewayIntentBits) as GatewayIntentBits[],
	partials: Object.values(Partials) as Partials[],
});

client.init(env.DISCORD_BOT_TOKEN);
