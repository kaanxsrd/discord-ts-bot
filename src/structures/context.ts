import type { ContextData } from '@/typings/context';

export class Context {
	public name: ContextData['name'];
	public description: ContextData['description'];
	public type: ContextData['type'];
	public cooldown: ContextData['cooldown'];
	public enabled: ContextData['enabled'];
	public ephemeral: ContextData['ephemeral'];
	public maintanence?: ContextData['maintanence'];
	public execute: ContextData['execute'];

	constructor(options: ContextData) {
		this.name = options.name;
		this.description = options.description;
		this.type = options.type;
		this.cooldown = options.cooldown;
		this.enabled = options.enabled;
		this.ephemeral = options.ephemeral;
		this.maintanence = options.maintanence;
		this.execute = options.execute;
	}
}
