
import { REST, Routes } from "discord.js";
import { commands } from "../src/commands";
import env from "../src/env";



(async function() {

    const cmdJson = (await commands.getAll()).map(command => command.builder().toJSON());

    const rest = new REST({ version: '10' }).setToken(env.DISCORD_BOT_TOKEN);

    try {
        console.log('Setting commands.');

        await rest.put(Routes.applicationCommands(env.DISCORD_BOT_APPLICATION_ID), { body: cmdJson });

        console.log('Successfully set commands.');
    } catch(err) {
        console.error(err);
    }

})();


