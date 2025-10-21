import {
	ChatInputCommandInteraction,
	Message,
	type MessagePayload,
} from 'discord.js';
import type {
	ContextData,
	DeferMessageContent,
	EditMessageContent,
} from '@/typings/interaction';
import type { Vaneta } from './client';

export class Context {
	public readonly ctx: ContextData['ctx'];
	public readonly interaction: ContextData['interaction'];
	public readonly message: ContextData['message'];
	public readonly id: ContextData['id'];
	public readonly channelId: ContextData['channelId'];
	public readonly client: ContextData['client'];
	public readonly author: ContextData['author'];
	public readonly channel: ContextData['channel'];
	public readonly guild: ContextData['guild'];
	public readonly createdAt: ContextData['createdAt'];
	public readonly createdTimestamp: ContextData['createdTimestamp'];
	public readonly member: ContextData['member'];
	public args: ContextData['args'];
	public msg: ContextData['msg'];

	constructor(options: ContextData) {
		this.ctx = options.ctx;
		this.interaction =
			options.ctx instanceof ChatInputCommandInteraction ? options.ctx : null;
		this.message = options.ctx instanceof Message ? options.ctx : null;
		this.id = options.ctx.id;
		this.channelId = options.ctx.channelId;
		this.channel = options.ctx.channel;
		this.client = options.ctx.client as Vaneta;
		this.author =
			options.ctx instanceof Message ? options.ctx.author : options.ctx.user;
		this.guild = options.ctx.guild;
		this.createdAt = options.ctx.createdAt;
		this.createdTimestamp = options.ctx.createdTimestamp;
		this.member = options.ctx.member;
		this.args = options.args;
		this.msg = undefined;
	}

	public get isInteraction(): boolean {
		return this.ctx instanceof ChatInputCommandInteraction;
	}

	public async sendMessage(content: MessagePayload): Promise<Message> {
		if (this.isInteraction && this.interaction) {
			await this.interaction.reply(content);
			const reply = await this.interaction.fetchReply();
			this.msg = reply;
			return reply;
		}

		if (this.message?.channel?.isSendable()) {
			const sent = await this.message.channel.send(content);
			this.msg = sent;
			return sent;
		}

		throw new Error('Unable to send message - no valid channel or interaction');
	}

	public async editMessage(content: EditMessageContent): Promise<Message> {
		if (this.isInteraction && this.interaction) {
			const reply = await this.interaction.editReply(content);
			this.msg = reply;
			return reply;
		}

		if (this.msg) {
			const edited = await this.msg.edit(content);
			this.msg = edited;
			return edited;
		}

		throw new Error('No message to edit');
	}

	public async sendDeferMessage(
		content: DeferMessageContent,
	): Promise<Message> {
		if (this.isInteraction && this.interaction) {
			await this.interaction.deferReply();
			const reply = await this.interaction.fetchReply();
			this.msg = reply;
			return reply;
		}

		if (this.message?.channel?.isSendable()) {
			const sent = await this.message.channel.send(content);
			this.msg = sent;
			return sent;
		}

		throw new Error(
			'Unable to send deferred message - no valid channel or interaction',
		);
	}

	public async sendFollowUp(
		content: MessagePayload,
	): Promise<Message | undefined> {
		if (this.isInteraction && this.interaction) {
			return await this.interaction.followUp(content);
		} else if (this.message?.channel?.isSendable()) {
			const sent = await this.message.channel.send(content);
			this.msg = sent;
			return sent;
		}
	}

	public get deferred(): boolean | undefined {
		return this.isInteraction ? this.interaction?.deferred : !!this.msg;
	}

	public readonly options = {
		getRole: (name: string, required = true) => {
			return this.interaction?.options.get(name, required)?.role;
		},
		getMember: (name: string, required = true) => {
			return this.interaction?.options.get(name, required)?.member;
		},
		get: (name: string, required = true) => {
			return this.interaction?.options.get(name, required);
		},
		getChannel: (name: string, required = true) => {
			return this.interaction?.options.get(name, required)?.channel;
		},
		getSubCommand: () => {
			return this.interaction?.options.data?.[0]?.name;
		},
	};
}
