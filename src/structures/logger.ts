import type { SignaleOptions } from 'signale';

import * as Package from 'signale';

const options: SignaleOptions = {
	disabled: false,
	interactive: false,
	logLevel: 'info',
	scope: 'Vaneta',
	types: {
		info: {
			badge: 'ℹ',
			color: 'blue',
			label: 'info',
		},
		warn: {
			badge: '⚠',
			color: 'yellow',
			label: 'warn',
		},
		error: {
			badge: '✖',
			color: 'red',
			label: 'error',
		},
		debug: {
			badge: '🐛',
			color: 'magenta',
			label: 'debug',
		},
		success: {
			badge: '✔',
			color: 'green',
			label: 'success',
		},
		log: {
			badge: '📝',
			color: 'white',
			label: 'log',
		},
	},

	config: {
		displayFilename: false,
	},
};

export default class Logger extends Package.Signale {
	constructor() {
		super(options);
	}
}
