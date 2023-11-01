import { Arg, Command } from "../lib/Command";
import { CommandCreator } from "../lib/CommandRegistry";

export const command: CommandCreator = options => {
    return new Command({
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
                required: true,
                description: 'user argument'
            })
        },
        executefn: async (interaction, args) => {

            console.log(args);

            await interaction.reply('Test');
    
        }
    });
}


