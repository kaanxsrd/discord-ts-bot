import util from 'node:util';
import {
	ActionRowBuilder,
	ApplicationCommandOptionType,
	ButtonBuilder,
	type ButtonInteraction,
	ButtonStyle,
	MessageFlags,
} from 'discord.js';
import { env } from '@/env';
import { Command } from '@/structures/command';
import evalUtil from '@/utils/common/eval';

export default new Command({
	name: 'eval',
	description: 'Evaluates arbitrary JavaScript code.',
	usage: 'eval <code>',
	category: 'Developer',
	cooldown: 0,
	aliases: [],
	slash: true,
	options: [
		{
			name: 'code',
			description: 'Code to evaluate',
			type: ApplicationCommandOptionType.String,
			required: true,
		},
	],

	async execute(client, ctx, args) {
		const code = args.join(' ');
		try {
			let evaled = evalUtil(code);

			if (typeof evaled !== 'string') {
				evaled = util.inspect(evaled, { depth: 1 });
			}

			const secrets = [client.token, env.DISCORD_BOT_TOKEN];
			for (const secret of secrets.filter(Boolean)) {
				evaled = evaled.replaceAll(secret, '[REDACTED]');
			}

			if (evaled.length > 2000) {
				const response = await fetch('https://hasteb.in/post', {
					method: 'POST',
					headers: {
						'Content-Type': 'text/plain',
					},
					body: evaled,
				});
				const json = (await response.json()) as { key: string };
				evaled = `https://hasteb.in/${json.key}`;
				return await ctx.sendMessage({
					content: evaled,
					flags: [MessageFlags.Ephemeral],
				});
			}

			const button = new ButtonBuilder()
				.setStyle(ButtonStyle.Danger)
				.setLabel('Delete')
				.setCustomId('eval-delete');
			const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);

			const msg = await ctx.sendMessage({
				content: `\`\`\`js\n${evaled}\n\`\`\``,
				components: [row],
				flags: [MessageFlags.Ephemeral],
			});

			const filter = (interaction: unknown): boolean => {
				if (typeof interaction !== 'object' || interaction === null)
					return false;
				if (!('customId' in interaction) || !('user' in interaction))
					return false;

				const user = (interaction as ButtonInteraction).user;
				return (
					(interaction as ButtonInteraction).customId === 'eval-delete' &&
					typeof user === 'object' &&
					user !== null &&
					'id' in user &&
					user.id === ctx.author?.id
				);
			};
			const collector = msg.createMessageComponentCollector({
				time: 60000,
				filter,
			});

			collector.on('collect', async (i) => {
				await i.deferUpdate();
				await msg.delete();
			});
		} catch (e) {
			await ctx.sendMessage({
				content: `\`\`\`js\n${e}\n\`\`\``,
				flags: [MessageFlags.Ephemeral],
			});
		}
	},
});
