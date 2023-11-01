
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




export const commands = registry;


