
import { Client, GatewayIntentBits } from "discord.js";
import env from "./env";
import { NodeUtils } from "./lib/NodeUtils";
import { type CommandRegistry } from "./lib/CommandRegistry";
import { reloadConfig } from "./config";



(async function() {



    let commands: CommandRegistry | null = null;



    const reloadCommands = async () => {

        await reloadConfig();

        if(commands) {
            await commands?.clearCache();
    
            commands = null;

            NodeUtils.CLEAR_REQUIRE_CACHE();
        }

        commands = (await import('./commands')).commands;

    }



    const consoleKeyPressListener = new NodeUtils.ConsoleKeyPressListener();

    consoleKeyPressListener.addEventListener('keypress', async key => {
        if(key.name == 'q' || (key.name == 'c' && key.ctrl)) {

            console.log('Exiting. . .');
            
            consoleKeyPressListener.destroyDispatcher();
            await client.destroy();
            // TODO: Don't do this, find a way to exit gracefully instead.
            process.exit(1);

        } else if(key.name == 'r') {

            console.log('Reloading commands.');

            if(key.ctrl) {
                console.log('Reloading slash commands.');
                await NodeUtils.execute('npm run bot-init-commands');
            }

            await reloadCommands();

            console.log('Reloaded commands.');

        } else if(key.name == 'c') {

            console.clear();

        }
    });

    console.log('┌─═ discord-bot-template ═────────────────────────┐');
    console.log('│ https://github.com/Potat05/discord-bot-template │');
    console.log('├─═ Keybinds ═──┬─────────────────────────────────┤');
    console.log('│ Q or Ctrl + C │ Stop bot                        │');
    console.log('│             R │ Reload commands                 │');
    console.log('│      Ctrl + R │ Reload slash commands           │');
    console.log('│             C │ Clear console                   │');
    console.log('└───────────────┴─────────────────────────────────┘');



    await reloadCommands();



    const client = new Client({ intents: [ GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages ] });

    client.on('ready', () => {
        console.log(`Logged in as ${client.user!.tag}`);
    });

    client.on('interactionCreate', async interaction => {
        if(!commands) return;
        if(!interaction.isChatInputCommand()) return;

        const command = await commands.get(interaction.commandName);
        if(!command) return;

        console.log(`${interaction.user.tag} used command ${command.name}`);

        command.execute(interaction);
        
    });

    client.on('interactionCreate', async interaction => {
        if(!commands) return;
        if(!interaction.isAutocomplete()) return;

        const command = await commands.get(interaction.commandName);
        if(!command) return;

        await command.autocomplete(interaction);

    });

    client.login(env.DISCORD_BOT_TOKEN);

})();
