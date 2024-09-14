import fs from "fs";
import path from "path";
import type { MapDefs } from "../../shared/defs/mapDefs";
import { GameConfig, TeamMode } from "../../shared/gameConfig";
import { util } from "../../shared/utils/util";

/**
 * Default server config
 */
export const Config = {
    devServer: {
        host: "127.0.0.1",
        port: 8001,
    },

    apiServer: {
        host: "0.0.0.0",
        port: 8000,
    },

    gameServer: {
        host: "0.0.0.0",
        port: 8001,
        apiServerUrl: "http://127.0.0.1:8000",
    },

    accountsEnabled: true,

    apiKey: "Kongregate Sucks",

    modes: [
        { mapName: "main", teamMode: TeamMode.Solo, enabled: true },
        { mapName: "main", teamMode: TeamMode.Duo, enabled: true },
        { mapName: "main", teamMode: TeamMode.Squad, enabled: true },
    ],

    regions: {},

    thisRegion: "local",

    gameTps: 100,
    netSyncTps: 33,

    perfLogging: {
        enabled: true,
        time: 10,
    },

    gameConfig: {},
} satisfies ConfigType as ConfigType;

const runningOnVite = process.argv.toString().includes("vite");
const isProduction = process.env["NODE_ENV"] === "production" && !runningOnVite;

if (!isProduction) {
    util.mergeDeep(Config, {
        regions: {
            local: {
                https: false,
                address: `${Config.devServer.host}:${Config.devServer.port}`,
                l10n: "index-local",
            },
        },
    });
}

const configPath = path.join(__dirname, isProduction ? "../../" : "", "../../");

function loadConfig(fileName: string, create?: boolean) {
    const path = `${configPath}${fileName}`;

    let loaded = false;
    if (fs.existsSync(path)) {
        const localConfig = JSON.parse(fs.readFileSync(path).toString());
        util.mergeDeep(Config, localConfig);
        loaded = true;
    } else if (create) {
        console.log("Config file doesn't exist... creating");
        fs.writeFileSync(path, JSON.stringify({}, null, 2));
    }

    util.mergeDeep(GameConfig, Config.gameConfig);
    return loaded;
}

// try loading old config file first for backwards compatibility
if (!loadConfig("resurviv-config.json")) {
    loadConfig("survev-config.json", true);
}

type DeepPartial<T> = T extends object
    ? {
          [P in keyof T]?: DeepPartial<T[P]>;
      }
    : T;

interface ServerConfig {
    readonly host: string;
    readonly port: number;

    /**
     * HTTPS/SSL options. Not used if running locally or with nginx.
     */
    readonly ssl?: {
        readonly keyFile: string;
        readonly certFile: string;
    };
}
export interface ConfigType {
    readonly devServer: ServerConfig;

    readonly apiServer: ServerConfig;
    readonly gameServer: ServerConfig & {
        readonly apiServerUrl: string;
    };

    /**
     * used to hide/disable account-related features in both client and server.
     */
    readonly accountsEnabled: boolean;

    /**
     * API key used for game server and API server to communicate
     */
    readonly apiKey: string;

    readonly regions: Record<
        string,
        {
            readonly https: boolean;
            readonly address: string;
            readonly l10n: string;
        }
    >;

    readonly thisRegion: string;

    readonly modes: Array<{
        readonly mapName: keyof typeof MapDefs;
        readonly teamMode: TeamMode;
        readonly enabled: boolean;
    }>;

    /**
     * Server tick rate
     */
    readonly gameTps: number;
    readonly netSyncTps: number;

    /**
     * Server logging
     */
    readonly perfLogging: {
        readonly enabled: boolean;
        /**
         * Seconds between each game performance log
         */
        readonly time: number;
    };

    /**
     * Game config overrides
     * @NOTE don't modify values used by client since this only applies to server
     */
    readonly gameConfig: DeepPartial<typeof GameConfig>;
}
