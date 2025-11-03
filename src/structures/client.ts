import {
	type ApplicationCommandDataResolvable,
	ApplicationCommandType,
	Client,
	type ClientEvents,
	Collection,
	type CommandInteraction,
	type Message,
} from 'discord.js';
import { env } from '@/env';
import Cooldown from '@/structures/cooldown';
import Logger from '@/structures/logger';
import type { CommandData } from '@/typings/command';
import type { ContextData } from '@/typings/context';
import type { EventData } from '@/typings/event';
import { handler } from '@/utils/common/handler';
import { recursiveReadDirSync } from '@/utils/common/loader';

export class Vaneta extends Client {
	public commands: Collection<string, CommandData> = new Collection();
	public contexts: Collection<string, ContextData> = new Collection();
	public handler = new handler();
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

	private async registerCommands(
		commands: ApplicationCommandDataResolvable[],
		target: 'guild' | 'global',
	): Promise<void> {
		if (!commands.length) return;

		if (target === 'guild') {
			const guild = this.guilds.cache.get(env.DEVELOPER_GUILD_ID);
			if (!guild) return this.logger.error('Developer guild not found.');
			await guild.commands.set(commands);
		} else {
			await this.application?.commands.set(commands);
		}
	}

	private buildCommandData(
		slashCommands: CommandData[],
		contextMenus: ContextData[],
	): ApplicationCommandDataResolvable[] {
		return [
			...slashCommands.map((cmd) => ({
				name: cmd.name,
				description: cmd.description,
				options: cmd.options,
				type: ApplicationCommandType.ChatInput,
			})),
			...contextMenus.map((ctx) => ({
				name: ctx.name,
				type: ctx.type,
			})),
		] as ApplicationCommandDataResolvable[];
	}

	public async loadInteractions(): Promise<void> {
		const slashCommands = Array.from(this.commands.values()).filter(
			(s) => s.slash === true,
		);
		const contextMenus = Array.from(this.contexts.values());

		if (!slashCommands.length && !contextMenus.length) return;

		const isMaintenance = (item: CommandData | ContextData): boolean =>
			item.maintanence === true;

		const maintenanceSlashCommands = slashCommands.filter(isMaintenance);
		const globalSlashCommands = slashCommands.filter(
			(cmd) => !isMaintenance(cmd),
		);

		const maintenanceContextMenus = contextMenus.filter(isMaintenance);
		const globalContextMenus = contextMenus.filter(
			(ctx) => !isMaintenance(ctx),
		);

		await this.registerCommands(
			this.buildCommandData(maintenanceSlashCommands, maintenanceContextMenus),
			'guild',
		);

		await this.registerCommands(
			this.buildCommandData(globalSlashCommands, globalContextMenus),
			'global',
		);
	}

	public async send(
		context: Message | CommandInteraction,
		content: string,
		time = 1000 * 5,
	) {
		context
			.reply({ content })
			.then((msg) => {
				setTimeout(() => msg.delete().catch(() => undefined), time);
			})
			.catch(() => undefined);

		return content;
	}

	public async init(token: string): Promise<void> {
		try {
			await this.login(token);
		} catch (err) {
			this.logger.error(`Failed to login: ${err}`);
			throw err;
		}
	}
}
