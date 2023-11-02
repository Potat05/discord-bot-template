




import { config } from "../config";
import { Arg, Command } from "../lib/Command";
import { CommandCreator } from "../lib/CommandRegistry";

export const creator: CommandCreator = options => {
    const command = new Command({
        name: options.name,
        description: 'Test command • Echo the message.',
        args: {
            rand: new Arg.Number({
                type: 'number',
                description: 'Random generated number.',
                min: 0,
                max: 1,
                autocomplete: async (value, interaction) => {
                    return new Array(10).fill(null).map(() => {
                        return {
                            name: `${Math.random()}`,
                            value: Math.random()
                        }
                    });
                }
            })
        },
        executefn: async (interaction, args) => {
            
            await interaction.reply(`${args.rand}`);

        }
    });

    return { command };
}


