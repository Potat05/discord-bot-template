
import * as dotenv from "dotenv";
import * as zod from "zod";

const DOTENV_SCHEMA = zod.object({
    DISCORD_BOT_TOKEN: zod.string(), // TODO: Make this more strict.
    DISCORD_BOT_APPLICATION_ID: zod.string().regex(/^\d+$/)
});

const env = DOTENV_SCHEMA.parse(dotenv.config().parsed);

export default env;
