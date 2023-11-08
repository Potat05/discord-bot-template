
## [Table of Contents](#table-of-contents)

* [Table of Contents](/docs/TableOfContents.md)
    * [Getting Started](/docs/GettingStarted.md)
    * \> [Command](/docs/Command.md)
    * [Config](/docs/Config.md)
        * DiscordUtils
            * [Interaction Helper](/docs/DiscordUtils/InteractionHelper.md)

# [Command](#command)

1. Look inside `src/commands/*.ts` for command examples.
2. Must define command inside `src/commands.ts`
    * If bot is running you may use **R** or **Ctrl + R** to reload commands.

`WARNING: Sub-commands are currently not supported.`

## [Example Command](#example-command)

`src/commands.ts`
```TypeScript
import { CommandRegistry } from "./lib/CommandRegistry";

const registry = new CommandRegistry();

// ...

// Add command to the command registry
registry.add({
    name: 'example', // The command name the user will input into chat.
    importer: () => import("./commands/example.ts") // The import to the file that contains the command.
});

// ...

export const commands = registry;
```

`src/commands/example.ts`
```JavaScript
import { Arg, Command } from "../lib/Command";
import { CommandCreator } from "../lib/CommandRegistry";

export const creator: CommandCreator = options => {
    const command = new Command({
        name: options.name,
        description: 'This is an example command to echo a message.',
        args: {
            echo: Arg.String({
                description: 'Message to echo back.',
                required: false,
                default: 'Hello, World!',
                minLength: 4,
                maxLength: 64
            })
        },
        executefn: (interaction, args) => {
            await interaction.reply(args.echo);
        }
    });

    return { command };
}
```



