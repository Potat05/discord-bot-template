import { Awaitable, CommandInteraction } from "discord.js";
import { Command } from "./Command";
import { EventDispatcher } from "./EventDispatcher";



export interface CommandCreatorArgs {
    readonly name: string;
}

export type CommandCreator = (options: CommandCreatorArgs) => Awaitable<{
    command: Command;
    destroy?: () => Awaitable<unknown>;
}>;

interface CommandRegistryImporter extends CommandCreatorArgs {
    readonly importer: () => Promise<{ creator: CommandCreator }>;
    cache?: {
        command: Command;
        destroy?: () => Awaitable<unknown>;
    };
}



export class CommandRegistry {
    
    public readonly importers: CommandRegistryImporter[] = [];

    public add(options: CommandRegistryImporter): void {
        this.importers.push(options);
    }



    public async clearCache(): Promise<void> {
        await Promise.all(this.importers.map(async importer => {
            if(importer.cache) {
                await importer.cache.destroy?.();
                delete importer.cache;
            }
        }));
    }



    public async get(name: string): Promise<Command | null> {
        const importer = this.importers.find(command => command.name == name);
        if(!importer) return null;

        if(importer.cache) {
            console.log(`${name} loaded from cache.`);
            return importer.cache.command;
        }

        console.log(`loading ${name}`);

        const created = await (await importer.importer()).creator(importer);

        importer.cache = {
            command: created.command,
            destroy: created.destroy
        }

        return created.command;
    }

    public async getAll(): Promise<Command[]> {
        return await Promise.all(this.importers.map(async importer => {
            return (await this.get(importer.name))!;
        }));
    }

}


