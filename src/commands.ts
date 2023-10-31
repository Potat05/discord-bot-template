import { ArgString, Command } from "./command";



export const commands: Command[] = [
    new Command({
        name: 'test',
        description: 'Testing command.',
        args: {
            msg: new ArgString({
                required: true,
                description: 'test'
            })
        },
        executefn: async (interaction, args) => {
            console.log(args);
            await interaction.reply(args.msg);
        }
    })
];


