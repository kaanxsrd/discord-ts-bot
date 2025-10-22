import {
	ApplicationCommandType,
	ButtonStyle,
	ContainerBuilder,
	MediaGalleryBuilder,
	MediaGalleryItemBuilder,
	MessageFlags,
	SeparatorBuilder,
} from 'discord.js';
import { Context } from '@/structures/context';

export default new Context({
	name: 'avatar',
	description: 'Get the avatar URL of a user.',
	type: ApplicationCommandType.User,
	cooldown: 5,
	enabled: true,
	ephemeral: true,
	maintanence: true,
	async execute(_client, interaction) {
		const user = interaction.targetId;
		const member = interaction.guild?.members.cache.get(user);
		if (!member) return interaction.followUp({ content: 'User not found.' });

		const container = new ContainerBuilder()
			.addMediaGalleryComponents(
				new MediaGalleryBuilder().addItems(
					new MediaGalleryItemBuilder().setURL(
						member.displayAvatarURL({ size: 4096 }),
					),
				),
			)
			.addSeparatorComponents(new SeparatorBuilder().setDivider(true))
			.addSectionComponents((section) =>
				section
					.addTextDisplayComponents((textDisplay) =>
						textDisplay.setContent(
							`Here is the avatar URL of ${member.toString()}`,
						),
					)
					.setButtonAccessory((button) =>
						button
							.setLabel('Link to Avatar')
							.setURL(member.displayAvatarURL({ size: 4096 }))
							.setStyle(ButtonStyle.Link),
					),
			);

		return interaction.followUp({
			components: [container],
			flags: MessageFlags.IsComponentsV2,
		});
	},
});
