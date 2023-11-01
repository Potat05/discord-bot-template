
import { CommandRegistry } from "./lib/CommandRegistry";



const registry = new CommandRegistry();

registry.add({
    name: 'echo',
    importer: () => import('./commands/echo')
});




export const commands = registry;


