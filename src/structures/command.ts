import type { CommandData } from '@/typings/command';

export class Command {
	public name: CommandData['name'];
	public description: CommandData['description'];
	public usage: CommandData['usage'];
	public category: CommandData['category'];
	public cooldown: CommandData['cooldown'];
	public aliases: CommandData['aliases'];
	public memberPerms?: CommandData['memberPerms'];
	public clientPerms?: CommandData['clientPerms'];
	public slash: CommandData['slash'];
	public maintanence?: CommandData['maintanence'];
	public options: CommandData['options'];
	public execute: CommandData['execute'];

	constructor(options: CommandData) {
		this.name = options.name;
		this.description = options.description;
		this.usage = options.usage;
		this.category = options.category;
		this.cooldown = options.cooldown;
		this.aliases = options.aliases;
		this.memberPerms = options.memberPerms;
		this.clientPerms = options.clientPerms;
		this.slash = options.slash;
		this.maintanence = options.maintanence;
		this.options = options.options;
		this.execute = options.execute;
	}
}
