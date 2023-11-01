import { Arg, Command } from "../lib/Command";
import { CommandCreator } from "../lib/CommandRegistry";

export const creator: CommandCreator = options => {
    const command = new Command({
        name: options.name,
        description: 'Debug command • This command will probably change alot.',
        args: {
            string: new Arg.String({
                description: 'string argument'
            }),
            number: new Arg.Number({
                description: 'number argument',
                type: 'integer',
            }),
            boolean: new Arg.Boolean({
                description: 'boolean argument'
            }),
            user: new Arg.User({
                description: 'user argument'
            }),
            channel: new Arg.Channel({
                description: 'channel argument'
            }),
            role: new Arg.Role({
                description: 'role argument'
            }),
            mentionable: new Arg.Mentionable({
                description: 'mentionable argument'
            }),
            attachment: new Arg.Attachment({
                description: 'attachment argument'
            })
        },
        executefn: async (interaction, args) => {

            await interaction.reply('test2');
    
        }
    });

    return { command };
}


