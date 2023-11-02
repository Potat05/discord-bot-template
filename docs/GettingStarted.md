
## [Table of Contents](#table-of-contents)

* [Table of Contents](/docs/TableOfContents.md)
    * \> [Getting Started](/docs/GettingStarted.md)
    * [Command](/docs/Command.md)
    * [Config](/docs/Config.md)

# [Getting Started](#getting-started)

1. Clone this repository
    * `curl -L https://github.com/Potat05/discord-bot-template/archive/main.tar.gz | tar zxf -`
2. Rename project to anything you want.
3. Set Discord bot environment variables in `/.env`
    ```env
    DISCORD_BOT_TOKEN=**BOT TOKEN HERE**
    DISCORD_BOT_APPLICATION_ID=**BOT APPLICATION ID HERE**
    ```
4. Download dependencies with `npm install`
5. Initialize commands with `npm run bot-init-commands`
6. Run bot with `npm run bot-start`
