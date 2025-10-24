import config from '@/config';
import { Event } from '@/structures/event';

export default new Event({
	name: 'messageCreate',
	async execute(client, message) {
		if (message.author.bot || !message.guild) return;

		const prefix = config.prefixes.find((p) =>
			message.content.toLowerCase().startsWith(p),
		);

		if (!prefix) return;

		const [commandName] = message.content
			.slice(prefix.length)
			.trim()
			.split(' ');

		if (!commandName) return;

		const command = client.commands.find(
			(c) =>
				c.name === commandName.toLowerCase() ||
				c?.aliases?.includes(commandName.toLowerCase()),
		);

		if (!command) return;

		client.handler.prefixHandler(client, message, command);
	},
});
