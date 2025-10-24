import {
	ChatInputCommandInteraction,
	type InteractionEditReplyOptions,
	type InteractionReplyOptions,
	Message,
	type MessageCreateOptions,
} from 'discord.js';
import type {
	ContextData,
	DeferMessageContent,
	EditMessageContent,
	MessageContent,
} from '@/typings/interaction';
import type { Vaneta } from './client';

export class Context {
	public ctx: ContextData['ctx'];
	public interaction: ContextData['interaction'];
	public message: ContextData['message'];
	public id: ContextData['id'];
	public channelId: ContextData['channelId'];
	public client: ContextData['client'];
	public author: ContextData['author'];
	public channel: ContextData['channel'];
	public guild: ContextData['guild'];
	public createdAt: ContextData['createdAt'];
	public createdTimestamp: ContextData['createdTimestamp'];
	public member: ContextData['member'];
	public args: ContextData['args'];
	public msg: ContextData['msg'];

	constructor(ctx: ChatInputCommandInteraction | Message, args: unknown[]) {
		this.ctx = ctx;
		this.interaction = ctx instanceof ChatInputCommandInteraction ? ctx : null;
		this.message = ctx instanceof Message ? ctx : null;
		this.channel = ctx.channel;
		this.id = ctx.id;
		this.channelId = ctx.channelId;
		this.client = ctx.client as Vaneta;
		this.author = ctx instanceof Message ? ctx.author : ctx.user;
		this.guild = ctx.guild;
		this.createdAt = ctx.createdAt;
		this.createdTimestamp = ctx.createdTimestamp;
		this.member = ctx.member;
		this.args = args as ContextData['args'];
		this.setArgs(args);
		this.msg = undefined;
	}

	public get isInteraction(): boolean {
		return this.ctx instanceof ChatInputCommandInteraction;
	}

	public setArgs(args: unknown[]): void {
		if (this.isInteraction) {
			this.args = args
				.filter(
					(arg): arg is { value: unknown } =>
						typeof arg === 'object' && arg !== null && 'value' in arg,
				)
				.map((arg) => arg.value) as ContextData['args'];
		} else {
			this.args = args as ContextData['args'];
		}
	}

	public async sendMessage(content: MessageContent): Promise<Message> {
		if (this.isInteraction && this.interaction) {
			this.msg = (await this.interaction.reply(
				content as InteractionReplyOptions,
			)) as unknown as Message;
			return this.msg;
		}

		if (this.message?.channel?.isSendable()) {
			this.msg = await this.message.channel.send(
				content as MessageCreateOptions,
			);
			return this.msg;
		}

		throw new Error('Unable to send message - no valid channel or interaction');
	}

	public async editMessage(content: EditMessageContent): Promise<Message> {
		if (this.isInteraction && this.interaction && this.msg) {
			this.msg = (await this.interaction.editReply(
				content as InteractionEditReplyOptions,
			)) as unknown as Message;
			return this.msg;
		}

		if (this.msg) {
			this.msg = await this.msg.edit(
				content as unknown as InteractionEditReplyOptions,
			);
			return this.msg;
		}

		throw new Error('No message to edit');
	}

	public async sendDeferMessage(
		content: DeferMessageContent,
	): Promise<Message> {
		if (this.isInteraction && this.interaction) {
			await this.interaction.deferReply();
			this.msg = (await this.interaction.fetchReply()) as unknown as Message;
			return this.msg;
		}

		if (this.message?.channel?.isSendable()) {
			this.msg = await this.message.channel.send(
				content as MessageCreateOptions,
			);
			return this.msg;
		}

		throw new Error(
			'Unable to send deferred message - no valid channel or interaction',
		);
	}

	public async sendFollowUp(
		content: MessageContent,
	): Promise<Message | undefined> {
		if (this.isInteraction && this.interaction) {
			return (await this.interaction.followUp(
				content as InteractionReplyOptions,
			)) as unknown as Message;
		}

		if (this.message?.channel?.isSendable()) {
			this.msg = await this.message.channel.send(
				content as MessageCreateOptions,
			);
			return this.msg;
		}
	}

	public get deferred(): boolean | undefined {
		return this.isInteraction ? this.interaction?.deferred : !!this.msg;
	}

	public readonly options = {
		getRole: (name: string, required = true) => {
			return this.interaction?.options.getRole(name, required);
		},
		getMember: (name: string) => {
			return this.interaction?.options.getMember(name);
		},
		getUser: (name: string, required = true) => {
			return this.interaction?.options.getUser(name, required);
		},
		get: (name: string, required = true) => {
			return this.interaction?.options.get(name, required);
		},
		getChannel: (name: string, required = true) => {
			return this.interaction?.options.getChannel(name, required);
		},
		getSubCommand: () => {
			return this.interaction?.options.getSubcommand(false);
		},
	};
}
