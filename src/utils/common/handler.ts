import {
	type ChatInputCommandInteraction,
	Message,
	type MessageContextMenuCommandInteraction,
	MessageFlags,
	type UserContextMenuCommandInteraction,
} from 'discord.js';
import config from '@/config';
import type { Vaneta } from '@/structures/client';
import type { Command } from '@/structures/command';
import type { Context } from '@/structures/context';
import { LimitFlags } from '@/typings/enums';

export class handler {
	cooldownHandler(
		client: Vaneta,
		context:
			| ChatInputCommandInteraction
			| MessageContextMenuCommandInteraction
			| UserContextMenuCommandInteraction
			| Message,
		command: Command | Context,
	): boolean {
		const userId =
			context instanceof Message ? context.author.id : context.user.id;

		const cooldown = client.cooldowns.checkLimit(
			userId,
			LimitFlags.Command,
			config.commandCooldowns.maxAttempts,
			config.commandCooldowns.windowDuration,
		);

		if (cooldown.hasLimit) {
			client.send(
				context,
				`You're doing things too quickly! Please slow down — you can run commands again ${cooldown.time}.`,
				cooldown.delete! - Date.now(),
			);
			return true;
		}

		if (command.cooldown) {
			const commandCooldown = client.cooldowns.checkLimit(
				userId,
				LimitFlags.Command,
				config.commandCooldowns.maxAttempts,
				config.commandCooldowns.windowDuration,
			);
			if (commandCooldown.hasLimit) {
				client.send(
					context,
					`That command is on cooldown! You can use it again ${commandCooldown.time}.`,
					commandCooldown.delete! - Date.now(),
				);
				return true;
			}
		}

		return false;
	}

	async slashCommand(
		client: Vaneta,
		interaction: ChatInputCommandInteraction,
		command: Command,
	) {}

	async contextCommand(
		client: Vaneta,
		interaction:
			| MessageContextMenuCommandInteraction
			| UserContextMenuCommandInteraction,
		command: Context,
	) {
		const isOnCooldown = this.cooldownHandler(client, interaction, command);
		if (isOnCooldown) return;

		try {
			await interaction.deferReply({
				flags: command.ephemeral ? [MessageFlags.Ephemeral] : [],
			});
			command.execute(client, interaction);
		} catch (ex) {
			interaction.followUp('Oops! An error occurred while running the command');
			client.logger.error(`Error executing context command: ${ex}`);
		}
	}
}
