
import { Client, GatewayIntentBits } from "discord.js";
import env from "./env";



(async function() {

    const client = new Client({ intents: [ GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages ] });

    client.on('ready', () => {
        console.log(`Logged in as ${client.user!.tag}`);
    });

    client.on('interactionCreate', async interaction => {
        if(!interaction.isChatInputCommand()) return;
    });

    client.login(env.DISCORD_BOT_TOKEN);

})();
