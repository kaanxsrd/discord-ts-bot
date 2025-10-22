import type { ClientEvents } from 'discord.js';
import type { Vaneta } from '@/structures/client';

export type EventKeys = keyof ClientEvents;

export type EventExecute<K extends EventKeys> = (
	client: Vaneta,
	...args: ClientEvents[K]
) => Promise<unknown> | unknown;

export interface EventData<K extends EventKeys> {
	name: K;
	once?: boolean;
	execute: EventExecute<K>;
}
