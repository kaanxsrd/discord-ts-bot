const evalUtil = (code: string) => {
	const transpiler = new Bun.Transpiler({
		loader: 'ts',
	});

	// biome-ignore lint/security/noGlobalEval: Required for eval command
	return eval(transpiler.transformSync(`eval((${code}))`));
};

export default evalUtil;
