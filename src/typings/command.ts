import type { APIApplicationCommandOption } from 'discord.js';
import type { Vaneta } from '@/structures/client';
import type { Context } from '@/structures/interaction';

export interface CommandData {
	name: string;
	description: string;
	category: string;
	cooldown: number;
	aliases: string[];
	memberPerms?: string[];
	clientPerms?: string[];
	slash: boolean;
	maintanence: boolean;
	options: APIApplicationCommandOption[];
	execute: (client: Vaneta, ctx: Context, args: string[]) => void;
}
