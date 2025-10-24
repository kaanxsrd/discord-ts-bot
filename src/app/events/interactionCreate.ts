import { Events, MessageFlags } from 'discord.js';
import { Event } from '@/structures/event';

export default new Event<Events.InteractionCreate>({
	name: Events.InteractionCreate,
	async execute(client, interaction) {
		if (interaction.isChatInputCommand()) {
			const command = client.commands.get(interaction.commandName);
			if (command)
				await client.handler.slashCommand(client, interaction, command);
		}

		if (interaction.isContextMenuCommand()) {
			const context = client.contexts.get(interaction.commandName);
			if (context)
				await client.handler.contextCommand(client, interaction, context);
			else
				return interaction
					.reply({
						content: 'An error has occurred',
						flags: [MessageFlags.Ephemeral],
					})
					.catch(() => {});
		}
	},
});
