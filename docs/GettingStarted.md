
# [Getting Started](/docs/GettingStarted.md)

1. Clone this repository
    1. Or clone without git history.
    2. `curl -L https://github.com/Potat05/discord-bot-template/archive/refs/heads/main.zip | tar -xz`
2. Set Discord bot environment variables in `/.env`
    ```env
    DISCORD_BOT_TOKEN=**BOT TOKEN HERE**
    DISCORD_BOT_APPLICATION_ID=**BOT APPLICATION ID HERE**
    ```
3. Initialize commands with `npm run bot-init-commands`
4. Run bot with `npm run bot-start`
