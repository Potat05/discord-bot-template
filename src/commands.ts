import { ArgString, Command } from "./command";



export const commands: Command[] = [
    new Command({
        name: 'echo',
        description: 'Test command • Echo the message.',
        args: {
            msg: new ArgString({
                required: true,
                description: 'test',
                minLength: 4,
                maxLength: 64
            })
        },
        executefn: async (interaction, args) => {

            await interaction.reply({
                embeds: [{
                    author: {
                        name: interaction.user.displayName,
                        icon_url: interaction.user.displayAvatarURL()
                    },
                    color: interaction.user.accentColor ?? 0x000000,
                    timestamp: new Date().toISOString(),
                    title: args.msg
                }]
            });

            console.log(args);

        }
    })
];


