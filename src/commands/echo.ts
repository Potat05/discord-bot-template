import { config } from "../config";
import { Arg, Command } from "../lib/Command";
import { CommandCreator } from "../lib/CommandRegistry";
import { wait } from "../lib/Utils";

export const creator: CommandCreator = options => {
    const command = new Command({
        name: options.name,
        description: 'Test command • Echo the message.',
        args: {
            msg: new Arg.String({
                required: true,
                description: 'Message to reply with.',
                minLength: 4,
                maxLength: 64
            }),
            count: new Arg.Number({
                required: false,
                default: 1,
                description: 'Number of times to reply.',
                type: 'integer',
                min: 1,
                max: 3
            })
        },
        executefn: async (interaction, args) => {
    
            const replyMessage = {
                embeds: [{
                    author: {
                        name: interaction.user.displayName,
                        icon_url: interaction.user.displayAvatarURL()
                    },
                    color: interaction.user.accentColor ?? 0x000000,
                    timestamp: new Date().toISOString(),
                    title: args.msg
                }]
            }
    
    
            let count = args.count;
    
            await interaction.reply(replyMessage);
    
            while(--count) {
                await wait(config.commands.echo.echoDelayMs);
    
                await interaction.followUp(replyMessage);
            }
    
        }
    });

    return { command };
}


