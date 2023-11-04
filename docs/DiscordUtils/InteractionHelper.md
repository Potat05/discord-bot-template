
## [Table of Contents](#table-of-contents)

* [Table of Contents](/docs/TableOfContents.md)
    * [Getting Started](/docs/GettingStarted.md)
    * [Command](/docs/Command.md)
    * [Config](/docs/Config.md)
        * DiscordUtils
            * \> [Interaction Helper](/docs/DiscordUtils/InteractionHelper.md)

# [Interaction Helper](#interaction-helper)

```TypeScript
import { InteractionHelper } from "/lib/DiscordUtils";
import { type Interaction } from "discord.js";
import { wait } from "/lib/Utils";

export async function doStuff(interaction: Interaction): Promise<void> {

    // InteractionHelper is a wrapper class for Discord interactions.
    const helper = new InteractionHelper(interaction, options: {
        ephemeral: false // If the replies are only visible to interaction user.
    });

    // InteractionHelper.show replies or edit the reply to the current interaction.
    await helper.show(`Hello, ${helper.user.username}!`);

    // InteractionHelper.showFast defers updating the reply until a certain time has passed since last reply.
    // If there is already a reply being deferred it will override the older one.
    await wait(Math.random() * 3000);
    helper.showFast(`Bye, ${helper.user.username}`);
    // ^ Will always display 3 seconds after the first reply even though we wait a random amount. 
    // This will not return a promise unlike InteractionHelper.show.

}
```
