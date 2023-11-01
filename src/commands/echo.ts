import { Arg, Command } from "../lib/Command";
import { CommandCreator } from "../lib/CommandRegistry";

export const command: CommandCreator = options => {
    return new Command({
        name: 'echo',
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
    
            console.log(args);
    
    
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
                await new Promise(r => setTimeout(r, 1000));
    
                await interaction.followUp(replyMessage);
            }
    
        }
    });
}


