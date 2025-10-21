import { Collection, time } from 'discord.js';

interface UserLimit {
	count: number;
	lastUsage: number;
}

interface LimitResult {
	hasLimit: boolean;
	time?: string;
	delete?: number;
}

export class Cooldown {
	private limits: Collection<string, UserLimit> = new Collection();

	constructor() {
		setInterval(() => {
			this.limits.sweep((v) => 1000 * 60 * 60 >= Date.now() - v.lastUsage);
		}, 1000 * 30);
	}

	checkLimit(
		id: string,
		type: number,
		count = 5,
		minutes = 1000 * 60 * 15,
	): LimitResult {
		const now = Date.now();

		const userLimits = this.limits.get(`${id}-${type}`);
		if (!userLimits) {
			this.limits.set(`${id}-${type}`, { count: 1, lastUsage: now });
			return { hasLimit: false };
		}

		userLimits.count = userLimits.count + 1;
		const diff = now - userLimits.lastUsage;

		if (diff < minutes && userLimits.count >= count) {
			return {
				hasLimit: true,
				time: time(Math.floor((userLimits.lastUsage + minutes) / 1000), 'R'),
				delete: userLimits.lastUsage + minutes,
			};
		}

		if (diff > minutes) this.limits.delete(id);
		else this.limits.set(id, userLimits);
		return { hasLimit: false };
	}
}

export default Cooldown;
