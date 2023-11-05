
import { CommandRegistry } from "./lib/CommandRegistry";



const registry = new CommandRegistry();

registry.add({
    name: 'echo',
    importer: () => import('./commands/echo')
});

registry.add({
    name: 'debug',
    importer: () => import('./commands/debug')
});

registry.add({
    name: 'wordle',
    importer: () => import('./commands/wordle')
});

registry.add({
    name: 'picross',
    importer: () => import('./commands/picross')
});



export const commands = registry;


