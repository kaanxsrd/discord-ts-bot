import type {
	ApplicationCommandType,
	ContextMenuCommandInteraction,
} from 'discord.js';
import type { Vaneta } from '@/structures/client';

export interface ContextData {
	name: string;
	description: string;
	type: ApplicationCommandType;
	cooldown: number;
	enabled: boolean;
	ephemeral: boolean;
	execute: (client: Vaneta, ctx: ContextMenuCommandInteraction) => void;
}
