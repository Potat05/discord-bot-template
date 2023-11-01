import { Command } from "./command";



const importers: {[key: string]: () => Promise<{ command: Command }>} = {
    'echo': () => import('./commands/echo')
}



export async function getCommand(name: string): Promise<Command | null> {

    const importer = importers[name];
    if(!importer) return null;

    return (await importer()).command;
    
}


