import { federation as moduleFederation } from '@module-federation/vite';
import { defineConfig as DC, loadEnv, PluginOption, UserConfig, UserConfigFnObject } from 'vite';
import path from 'path';
import { writeFileSync } from 'fs';
import fs from 'node:fs';

const REMOTE_ENTRY = 'remoteEntry.js';

const loadGlobalEnv = (mode: string, currentWorkingDir = process.cwd()): Record<string, string> => {
	const parentDir = path.dirname(currentWorkingDir);

	const globalEnv = loadEnv(mode, parentDir);

	if (Object.keys(globalEnv).length > 1) return globalEnv;

	return loadGlobalEnv(mode, parentDir);
};

const loadEnvs = (mode: string) => {
	const globalEnv = loadGlobalEnv(mode);
	const localEnv = loadEnv(mode, process.cwd());

	const env = {
		...globalEnv,
		...localEnv,
	};

	Object.assign(process.env, env);

	return env;
};

const getProcessVariable = (env: Record<string, string>) => {
	const project = process.cwd().split('/').pop();

	const url = env[`VITE_${project?.toUpperCase()}`];
	const port = url.split(':').pop();

	return {
		port: parseInt(port ?? '0'),
		url,
	};
};

const createRemoteEntry = (name: string, entry: string) => {
	return {
		type: 'module',
		name,
		entry: `${entry}/${REMOTE_ENTRY}`,
		entryGlobalName: name,
		shareScope: 'default',
	};
};

export const defineCommonConfig = (mode: string) => {
	const env = loadEnvs(mode);
	const { port, url } = getProcessVariable(env);

	const base = {
		resolve: {
			alias: {
				src: '/src',
			},
		},
		server: {
			strictPort: true,
			port,
		},
		preview: {
			strictPort: true,
			port,
		},
		base: url,
		build: {
			target: 'chrome89',
		},
	};

	const excluded = ['VITE_MODE', 'VITE_PORT'];

	const keys = Object.keys(env)
		.filter((key) => key.startsWith('VITE_') && !excluded.includes(key))
		.map((k) => ({
			name: k.replace('VITE_', '').toLowerCase(),
			env: env[k],
		}));

	const remotes = keys.reduce((acc, key) => {
		acc[key.name] = createRemoteEntry(key.name, key.env);

		return acc;
	}, {} as any);

	const plugins = [
		{
			name: 'generate-environment',
			options: function () {
				writeFileSync('./src/environment.ts', `export default ${JSON.stringify(env, null, 2)};`);
			},
		},
	];

	return {
		selfEnv: env,
		base,
		remotes,
		plugins,
	};
};

export interface Config {
	name: string;
	exposes?: Record<string, string>;
	filename?: string;
	shared?: Record<string, any>;
	remotes?: Record<string, any>;
}

const readPackageJson = () => {
	try {
		const filePath = path.join(process.cwd(), 'package.json');

		const data = fs.readFileSync(filePath, 'utf8');
		return JSON.parse(data);
	} catch {
		return {};
	}
};

const readSharedDependencies = () => {
	const packageJson = readPackageJson();

	return Object.keys(packageJson.dependencies).reduce((acc, dependency) => {
		acc[dependency] = {
			requiredVersion: packageJson.dependencies[dependency],
			singleton: true,
		};
		return acc;
	}, {} as any);
};

export const federation = (config: Config): PluginOption[] => {
	const shared = readSharedDependencies();

	return moduleFederation({
		filename: REMOTE_ENTRY,
		shared,
		...config,
	});
};

export interface MfConfig extends UserConfig {
	federation: Config;
}
export interface MfConfigExport extends UserConfigFnObject {}

export function defineConfig(customConfig: MfConfig): MfConfigExport {
	return DC(({ mode }) => {
		const { remotes, base } = defineCommonConfig(mode);
		const { plugins: customPlugins, ...config } = customConfig;

		const plugins: PluginOption[] = [
			federation({
				...customConfig.federation,
				remotes,
			}),
			...(customPlugins ?? []),
		];

		return {
			...base,
			...config,
			plugins,
		};
	});
}
