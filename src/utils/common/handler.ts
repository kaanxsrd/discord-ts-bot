import {
	type ChatInputCommandInteraction,
	type GuildMember,
	Message,
	type MessageContextMenuCommandInteraction,
	MessageFlags,
	PermissionsBitField,
	type TextChannel,
	type UserContextMenuCommandInteraction,
} from 'discord.js';
import config from '@/config';
import { env } from '@/env';
import type { Vaneta } from '@/structures/client';
import type { Command } from '@/structures/command';
import type { Context as ContextMenuCommand } from '@/structures/context';
import { Context as InteractionContext } from '@/structures/interaction';
import { LimitFlags } from '@/typings/enums';
import {
	getPermissionName,
	permissionsMap,
} from '@/utils/formatting/permissions';

export class handler {
	cooldownHandler(
		client: Vaneta,
		context:
			| ChatInputCommandInteraction
			| MessageContextMenuCommandInteraction
			| UserContextMenuCommandInteraction
			| Message,
		command: Command | ContextMenuCommand,
	): boolean {
		const userId =
			context instanceof Message ? context.author.id : context.user.id;

		const cooldown = client.cooldowns.checkLimit(
			userId,
			LimitFlags.Command,
			config.commandCooldowns.maxAttempts,
			config.commandCooldowns.windowDuration,
		);

		if (cooldown.hasLimit && cooldown.delete) {
			client.send(
				context,
				`You're doing things too quickly! Please slow down — you can run commands again ${cooldown.time}.`,
				cooldown.delete - Date.now(),
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
			if (commandCooldown.hasLimit && commandCooldown.delete) {
				client.send(
					context,
					`That command is on cooldown! You can use it again ${commandCooldown.time}.`,
					commandCooldown.delete - Date.now(),
				);
				return true;
			}
		}

		return false;
	}

	async prefixHandler(client: Vaneta, message: Message, command: Command) {
		const prefix = config.prefixes.find((p) =>
			message.content.toLowerCase().startsWith(p),
		);

		if (!prefix) return;

		const [_, ...args] = message.content.slice(prefix.length).trim().split(' ');

		const isOnCooldown = this.cooldownHandler(client, message, command);
		if (isOnCooldown) return;

		if (
			command.category === 'root' &&
			env.DEVELOPER_USER_ID !== message.author.id
		) {
			return client.send(
				message,
				'You do not have permission to use this command.',
			);
		}

		if (command.clientPerms && command.clientPerms.length > 0) {
			const neededPerms: string[] = [];
			const botUser = client.user;

			if (!botUser) return;

			command.clientPerms.forEach((perm) => {
				if (
					[
						PermissionsBitField.Flags.Speak,
						PermissionsBitField.Flags.Connect,
					].includes(perm)
				) {
					const member = message.guild?.members.cache.get(botUser.id);
					if (!member?.voice?.channel) return;
					const voicePerms = member.voice.channel.permissionsFor(botUser);
					if (voicePerms && !voicePerms.has(perm)) {
						const permName = getPermissionName(perm);
						neededPerms.push(permName);
					}
				} else {
					const channelPerms = (message.channel as TextChannel).permissionsFor(
						botUser,
					);
					if (channelPerms && !channelPerms.has(perm)) {
						const permName = getPermissionName(perm);
						neededPerms.push(permName);
					}
				}
			});

			if (neededPerms.length > 0) {
				const formattedPerms = neededPerms
					.map((perm) => permissionsMap[perm] || perm)
					.join(', ');

				return client.send(
					message,
					`I'm missing the following permissions: ${formattedPerms}`,
				);
			}
		}

		if (command.memberPerms && command.memberPerms.length > 0) {
			const member = message.member;
			if (!member) return;

			const missingPerms: string[] = [];

			command.memberPerms.forEach((perm) => {
				if (!member.permissions.has(perm)) {
					const permName = getPermissionName(perm);
					missingPerms.push(permName);
				}
			});

			if (missingPerms.length > 0) {
				const formattedPerms = missingPerms
					.map((perm) => permissionsMap[perm] || perm)
					.join(', ');
				return client.send(
					message,
					`You are missing the following permissions to run this command: ${formattedPerms}`,
				);
			}
		}

		const ctx = new InteractionContext(message, args);

		ctx.setArgs(args);

		try {
			await command.execute(client, ctx, ctx.args as string[]);
		} catch (error) {
			try {
				await client.send(
					message,
					'An error occurred while executing this command.',
				);
			} catch (replyError) {
				client.logger.error('Failed to send error message:', replyError);
			}
			client.logger.error(`Error executing command ${command.name}:`, error);
		}
	}

	async slashCommand(
		client: Vaneta,
		interaction: ChatInputCommandInteraction,
		command: Command,
	) {
		const isOnCooldown = this.cooldownHandler(client, interaction, command);
		if (isOnCooldown) return;

		if (
			command.category === 'root' &&
			env.DEVELOPER_USER_ID !== interaction.user.id
		) {
			return interaction.followUp({
				content: 'You do not have permission to use this command.',
				flags: [MessageFlags.Ephemeral],
			});
		}

		if (
			interaction.guild &&
			command.clientPerms &&
			command.clientPerms.length > 0
		) {
			const neededPerms: string[] = [];
			const botUser = client.user;

			if (!botUser) return;

			command.clientPerms.forEach((perm) => {
				if (
					[
						PermissionsBitField.Flags.Speak,
						PermissionsBitField.Flags.Connect,
					].includes(perm)
				) {
					const member = interaction.member as GuildMember | null;
					if (!member?.voice?.channel) return;
					const voicePerms = member.voice.channel.permissionsFor(botUser);
					if (voicePerms && !voicePerms.has(perm)) {
						const permName = getPermissionName(perm);
						neededPerms.push(permName);
					}
				} else if (
					interaction.channel &&
					'permissionsFor' in interaction.channel
				) {
					const channelPerms = interaction.channel.permissionsFor(botUser);
					if (channelPerms && !channelPerms.has(perm)) {
						const permName = getPermissionName(perm);
						neededPerms.push(permName);
					}
				}
			});

			if (neededPerms.length > 0) {
				const formattedPerms = neededPerms
					.map((perm) => permissionsMap[perm] || perm)
					.join(', ');

				return interaction.followUp({
					content: `I'm missing the following permissions: ${formattedPerms}`,
					flags: [MessageFlags.Ephemeral],
				});
			}
		}

		if (
			interaction.guild &&
			command.memberPerms &&
			command.memberPerms.length > 0
		) {
			const member = interaction.member as GuildMember | null;
			if (!member) return;

			const missingPerms: string[] = [];

			command.memberPerms.forEach((perm) => {
				if (!member.permissions.has(perm)) {
					const permName = getPermissionName(perm);
					missingPerms.push(permName);
				}
			});

			if (missingPerms.length > 0) {
				const formattedPerms = missingPerms
					.map((perm) => permissionsMap[perm] || perm)
					.join(', ');
				return interaction.followUp({
					content: `You are missing the following permissions to run this command: ${formattedPerms}`,
					flags: [MessageFlags.Ephemeral],
				});
			}
		}

		const ctx = new InteractionContext(interaction, [
			...interaction.options.data,
		]);

		ctx.setArgs([...interaction.options.data]);

		try {
			await command.execute(client, ctx, ctx.args as string[]);
		} catch (error) {
			try {
				await interaction.followUp({
					content: 'An error occurred while executing this command.',
					flags: [MessageFlags.Ephemeral],
				});
			} catch (replyError) {
				client.logger.error('Failed to send error message:', replyError);
			}
			client.logger.error(`Error executing command ${command.name}:`, error);
		}
	}

	async contextCommand(
		client: Vaneta,
		interaction:
			| MessageContextMenuCommandInteraction
			| UserContextMenuCommandInteraction,
		command: ContextMenuCommand,
	) {
		const isOnCooldown = this.cooldownHandler(client, interaction, command);
		if (isOnCooldown) return;

		try {
			await interaction.deferReply({
				flags: command.ephemeral ? [MessageFlags.Ephemeral] : [],
			});
			await command.execute(client, interaction);
		} catch (ex) {
			try {
				await interaction.followUp({
					content: 'Oops! An error occurred while running the command',
					flags: [MessageFlags.Ephemeral],
				});
			} catch (replyError) {
				client.logger.error('Failed to send error message:', replyError);
			}
			client.logger.error(`Error executing context command:`, ex);
		}
	}
}
