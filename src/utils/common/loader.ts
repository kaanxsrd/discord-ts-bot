import { lstatSync, readdirSync } from 'node:fs';
import { extname, join } from 'node:path';

export function recursiveReadDirSync(
	dir: string,
	allowedExtensions: string[] = ['.ts'],
): string[] {
	const filePaths: string[] = [];

	const readCommands = (dir: string): void => {
		const files = readdirSync(join(process.cwd(), dir));

		files.forEach((file: string) => {
			const stat = lstatSync(join(process.cwd(), dir, file));

			if (stat.isDirectory()) {
				readCommands(join(dir, file));
			} else {
				const extension = extname(file);

				if (!allowedExtensions.includes(extension)) return;

				const filePath = join(process.cwd(), dir, file);
				filePaths.push(filePath);
			}
		});
	};

	readCommands(dir);
	return filePaths;
}
