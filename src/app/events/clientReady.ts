import { Events } from 'discord.js';
import { Event } from '@/structures/event';

export default new Event<Events.ClientReady>({
  name: Events.ClientReady,
  async execute(client) {
    client.logger.success(
      `Client is ready! Logged in as ${client.user?.tag} loaded ${client.commands.size} commands and ${client.contexts.size} contexts.`
    );

    await client.loadInteractions();
  },
});
