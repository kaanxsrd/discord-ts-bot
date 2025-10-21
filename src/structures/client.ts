import { Client, Collection } from 'discord.js';
import Logger from '@/structures/logger';

export class Vaneta extends Client {
	public commands: Collection<string, unknown> = new Collection();
	public contexts: Collection<string, unknown> = new Collection();
	public events: Collection<string, unknown> = new Collection();
	public cooldown: Collection<string, unknown> = new Collection();
	public logger = new Logger();

	public async init(token: string): Promise<void> {
		await this.login(token)
			.catch((err) => {
				this.logger.error(`Failed to login: ${err}`);
				process.exit(1);
			})
			.then(() => {
				this.logger.success('Successfully logged in!');
			});
	}
}
