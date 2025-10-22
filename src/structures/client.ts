import { Client, type ClientEvents, Collection } from 'discord.js';
import Cooldown from '@/structures/cooldown';
import Logger from '@/structures/logger';

import type { CommandData } from '@/typings/command';
import type { ContextData } from '@/typings/context';
import type { EventData } from '@/typings/event';
import { recursiveReadDirSync } from '@/utils/common/loader';

export class Vaneta extends Client {
	public commands: Collection<string, CommandData> = new Collection();
	public contexts: Collection<string, ContextData> = new Collection();
	public cooldowns = new Cooldown();
	public logger = new Logger();

	public loadCommands(directory: string): void {
		this.logger.info(`Loading commands...`);
		const files = recursiveReadDirSync(directory);
		for (const file of files) {
			import(file).then((commandModule) => {
				const command: CommandData = commandModule.default;
				if (!command || !command.name) {
					this.logger.warn(`Invalid command file: ${file}`);
					return;
				}
				this.commands.set(command.name, command);
				this.logger.success(`Loaded command: ${command.name}`);
			});
		}
	}

	public loadContexts(directory: string): void {
		this.logger.info(`Loading contexts...`);
		const files = recursiveReadDirSync(directory);
		for (const file of files) {
			import(file).then((contextModule) => {
				const context: ContextData = contextModule.default;
				if (!context || !context.name) {
					this.logger.warn(`Invalid context file: ${file}`);
					return;
				}
				this.contexts.set(context.name, context);
				this.logger.success(`Loaded context: ${context.name}`);
			});
		}
	}

	public loadEvents(directory: string): void {
		this.logger.info(`Loading events...`);
		const files = recursiveReadDirSync(directory);
		for (const file of files) {
			import(file).then((eventModule) => {
				const event: EventData<keyof ClientEvents> = eventModule.default;
				if (!event || !event.name || !event.execute) {
					this.logger.warn(`Invalid event file: ${file}`);
					return;
				}
				this.on(
					event.name as keyof ClientEvents,
					event.execute.bind(null, this),
				);
			});
		}
	}

	public async init(token: string): Promise<void> {
		await this.login(token).catch((err) => {
			this.logger.error(`Failed to login: ${err}`);
			process.exit(1);
		});
	}
}
