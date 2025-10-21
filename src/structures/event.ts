import type { EventData, EventKeys } from '@/typings/event';

export class Event<K extends EventKeys> {
	public readonly name: EventData<K>['name'];
	public readonly once: EventData<K>['once'];
	public readonly execute: EventData<K>['execute'];

	constructor(options: EventData<K>) {
		this.name = options.name;
		this.once = options.once ?? false;
		this.execute = options.execute;
	}
}
