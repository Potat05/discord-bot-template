
import * as zod from "zod";
import { PartialDeep } from "./lib/Types";



const CONFIG = zod.object({
    commands: zod.object({
        echo: zod.object({
            echoDelayMs: zod.number().int().min(1000).max(60 * 1000).default(1000)
        }).default({})
    }).default({})
});



export function defineConfig(definedConfig: PartialDeep<zod.TypeOf<typeof CONFIG>>): zod.TypeOf<typeof CONFIG> {
    return CONFIG.parse(definedConfig);
}

import definedConfig from "../config"

export let config: zod.TypeOf<typeof CONFIG> = definedConfig;

export async function reloadConfig(): Promise<void> {
    const module = require.resolve('../config');
    delete require.cache[module];
    config = (await import('../config')).default;
}
