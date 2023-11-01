import { Awaitable, CommandInteraction } from "discord.js";
import { Command } from "./Command";
import { EventDispatcher } from "./EventDispatcher";



export interface CommandCreatorArgs {
    readonly name: string;
}

export type CommandCreator = (options: CommandCreatorArgs) => Awaitable<Command>;

interface CommandRegistryImporter extends CommandCreatorArgs {
    readonly importer: () => Promise<{ command: CommandCreator }>;
}



export class CommandRegistry extends EventDispatcher<{
    beforeExecute: (command: Command, interaction: CommandInteraction) => unknown;
}> {
    
    public readonly importers: CommandRegistryImporter[] = [];

    public add(options: CommandRegistryImporter): void {
        this.importers.push(options);
    }

    public async get(name: string): Promise<Command | null> {
        const importer = this.importers.find(command => command.name == name);
        if(!importer) return null;

        const imported = await importer.importer();
        const command = await imported.command(importer);

        return command;
    }

    public async getAll(): Promise<Command[]> {
        return await Promise.all(this.importers.map(async importer => {
            const imported = await importer.importer();
            const command = await imported.command(importer);

            return command;
        }));
    }

}


