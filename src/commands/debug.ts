import { Arg, Command } from "../lib/Command";
import { CommandCreator } from "../lib/CommandRegistry";

export const command: CommandCreator = options => {
    return new Command({
        name: 'debug',
        description: 'Debug command • This command will probably change alot.',
        args: {
            argString: new Arg.String({
                description: 'argString'
            }),
            argNumber: new Arg.Number({
                description: 'argNumber',
                type: 'integer',
            }),
            argBoolean: new Arg.Boolean({
                description: 'argBoolean'
            }),
            argUser: new Arg.User({
                description: 'argUser'
            })
        },
        executefn: async (interaction, args) => {

            await interaction.reply('Test');
    
        }
    });
}


