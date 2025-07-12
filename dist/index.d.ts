import { PluginOption, UserConfig, UserConfigFnObject } from 'vite';
export declare const defineCommonConfig: (mode: string) => {
    selfEnv: {
        [x: string]: string;
    };
    base: {
        resolve: {
            alias: {
                src: string;
            };
        };
        server: {
            strictPort: boolean;
            port: number;
        };
        preview: {
            strictPort: boolean;
            port: number;
        };
        base: string;
        build: {
            target: string;
        };
    };
    remotes: any;
    plugins: {
        name: string;
        options: () => void;
    }[];
};
export interface Config {
    name: string;
    exposes?: Record<string, string>;
    filename?: string;
    shared?: Record<string, any>;
    remotes?: Record<string, any>;
}
export declare const federation: (config: Config) => PluginOption[];
export interface MfConfig extends UserConfig {
    federation: Config;
}
export interface MfConfigExport extends UserConfigFnObject {
}
export declare function defineConfig(customConfig: MfConfig): MfConfigExport;
