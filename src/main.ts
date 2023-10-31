
import { Client, GatewayIntentBits } from "discord.js";
import env from "./env";
import { ArgString, Command } from "./command";
import { commands } from "./commands";



(async function() {

    const client = new Client({ intents: [ GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages ] });

    client.on('ready', () => {
        console.log(`Logged in as ${client.user!.tag}`);
    });

    client.on('interactionCreate', async interaction => {
        if(!interaction.isChatInputCommand()) return;

        for(const command of commands) {
            if(command.name != interaction.commandName) continue;

            command.execute(interaction);

            break;
        }

    });

    client.login(env.DISCORD_BOT_TOKEN);

})();
