
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
    name: 'test',
    importer: () => import('./commands/test')
});



export const commands = registry;


