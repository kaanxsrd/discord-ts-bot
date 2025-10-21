import type {
	APIInteractionGuildMember,
	ChatInputCommandInteraction,
	Guild,
	GuildMember,
	GuildMemberResolvable,
	InteractionEditReplyOptions,
	InteractionReplyOptions,
	Message,
	MessageCreateOptions,
	MessageEditOptions,
	MessagePayload,
	TextBasedChannel,
	User,
} from 'discord.js';
import type { Vaneta } from '@/structures/client';

export type MessageContent =
	| string
	| MessagePayload
	| MessageCreateOptions
	| InteractionReplyOptions;
export type EditMessageContent =
	| string
	| MessagePayload
	| InteractionEditReplyOptions
	| MessageEditOptions;
export type DeferMessageContent =
	| string
	| MessagePayload
	| MessageCreateOptions;

export interface ContextData {
	ctx: ChatInputCommandInteraction | Message;
	args: Array<string | number | boolean | { value: unknown }>;
	interaction?: ChatInputCommandInteraction | null;
	message?: Message | null;
	id?: string;
	channelId?: string;
	client?: Vaneta;
	author?: User | null;
	channel?: TextBasedChannel | null;
	guild?: Guild | null;
	createdAt?: Date;
	createdTimestamp?: number;
	member?:
		| GuildMemberResolvable
		| GuildMember
		| APIInteractionGuildMember
		| null;
	msg?: Message | undefined;
	isInteraction?: boolean;
	deferred?: boolean | undefined;
}
